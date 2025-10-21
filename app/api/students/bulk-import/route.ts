import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

// Server-side admin client with service role key
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

interface BulkImportStudent {
  name: string;
  username: string;
  password: string;
  preferred_modules: string[];
  type: string | null;
}

/**
 * Parse full name from "Last, First Middle" format
 */
function parseName(fullName: string): {
  firstName: string;
  middleName?: string;
  lastName: string;
} {
  const parts = fullName.split(',').map((p) => p.trim());

  if (parts.length < 2) {
    const nameParts = fullName.trim().split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts[nameParts.length - 1] || '',
      middleName:
        nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined,
    };
  }

  const lastName = parts[0];
  const remainingName = parts[1].trim().split(' ');

  const firstName = remainingName[0] || '';
  const middleName =
    remainingName.length > 1 ? remainingName.slice(1).join(' ') : undefined;

  return { firstName, middleName, lastName };
}

/**
 * Map VARK module names to learning style
 */
function mapLearningStyle(
  preferredModules: string[]
): 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic' | undefined {
  if (!preferredModules || preferredModules.length === 0) {
    return undefined;
  }

  const moduleMap: Record<string, string> = {
    Visual: 'visual',
    Aural: 'auditory',
    'Read/Write': 'reading_writing',
    Kinesthetic: 'kinesthetic',
  };

  for (const module of preferredModules) {
    if (moduleMap[module]) {
      return moduleMap[module] as any;
    }
  }

  return 'reading_writing';
}

export async function POST(request: NextRequest) {
  try {
    const students: BulkImportStudent[] = await request.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of students.' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    console.log(`📥 Starting bulk import of ${students.length} students...`);

    // OPTIMIZATION: Query all existing student emails in one go
    console.log('🔍 Checking for existing students...');
    const { data: existingProfiles, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'student');

    if (queryError) {
      console.error('Error querying existing students:', queryError);
      return NextResponse.json(
        { error: 'Failed to query existing students' },
        { status: 500 }
      );
    }

    // Create a Set for O(1) lookup
    const existingEmails = new Set(
      (existingProfiles || []).map((p) => p.email.toLowerCase())
    );
    console.log(`📋 Found ${existingEmails.size} existing students in database`);

    // Parse and filter students
    const studentsToImport = [];

    for (const student of students) {
      try {
        const { firstName, middleName, lastName } = parseName(student.name);
        const email = `${student.username}@student.com`.toLowerCase();

        if (existingEmails.has(email)) {
          console.log(`⏭️  Skipping existing student: ${email}`);
          results.skipped++;
          continue;
        }

        const learningStyle = mapLearningStyle(student.preferred_modules);

        studentsToImport.push({
          originalData: student,
          email,
          firstName,
          middleName,
          lastName,
          learningStyle,
          preferredModules: student.preferred_modules || [],
          learningType: student.type ? student.type : undefined,
        });
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${student.name}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(`✅ ${studentsToImport.length} new students to import`);
    console.log(`⏭️  ${results.skipped} students already exist (skipped)`);

    // Import new students
    for (const studentData of studentsToImport) {
      try {
        // Create user in Supabase Auth using admin client
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: studentData.email,
            password: studentData.originalData.password,
            email_confirm: true,
            user_metadata: {
              first_name: studentData.firstName,
              middle_name: studentData.middleName,
              last_name: studentData.lastName,
              role: 'student',
              learning_style: studentData.learningStyle,
              grade_level: 'Grade 7',
            },
          });

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('User creation failed');
        }

        // Create profile
        const profileData: any = {
          id: authData.user.id,
          email: studentData.email,
          first_name: studentData.firstName,
          middle_name: studentData.middleName || null,
          last_name: studentData.lastName,
          full_name: studentData.originalData.name,
          role: 'student',
          learning_style: studentData.learningStyle || null,
          grade_level: 'Grade 7',
          onboarding_completed: true,
        };

        if (studentData.preferredModules && studentData.preferredModules.length > 0) {
          profileData.preferred_modules = studentData.preferredModules;
        }
        if (studentData.learningType) {
          profileData.learning_type = studentData.learningType;
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          // Clean up auth user if profile creation fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw new Error(profileError.message);
        }

        results.success++;
        console.log(`✅ Created: ${studentData.email}`);
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${studentData.originalData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        console.error(`❌ Failed: ${studentData.email}`, error);
      }
    }

    console.log('📊 Bulk import results:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
