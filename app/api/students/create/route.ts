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

// Also need regular client for checking existing users
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

interface StudentData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  gradeLevel?: string;
  learningStyle?: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  preferredModules?: string[];
  learningType?: string;
  onboardingCompleted?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: StudentData = await request.json();

    console.log('Creating student:', data.email);

    // Generate email if not provided
    const email =
      data.email ||
      `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@student.com`;

    // Check if student with this email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: `A student with email ${email} already exists` },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth using admin client
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          middle_name: data.middleName,
          last_name: data.lastName,
          role: 'student',
          learning_style: data.learningStyle,
          grade_level: data.gradeLevel,
        },
      });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // Create profile
    const profileData: any = {
      id: authData.user.id,
      email: email,
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      full_name:
        data.fullName ||
        `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim(),
      role: 'student',
      learning_style: data.learningStyle || null,
      grade_level: data.gradeLevel || null,
      onboarding_completed: data.onboardingCompleted ?? true,
    };

    // Add preferred_modules and learning_type as JSONB
    if (data.preferredModules && data.preferredModules.length > 0) {
      profileData.preferred_modules = data.preferredModules;
    }
    if (data.learningType) {
      profileData.learning_type = data.learningType;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    console.log('✅ Student created:', email);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create student',
      },
      { status: 500 }
    );
  }
}
