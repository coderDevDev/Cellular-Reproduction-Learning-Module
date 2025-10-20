import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { toast } from 'sonner';

// Admin client for bypassing RLS
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
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
  learningType?: string; // "Unimodal", "Bimodal", "Trimodal", "Multimodal"
  onboardingCompleted?: boolean;
}

interface BulkImportStudent {
  name: string; // "Last, First Middle"
  username: string; // "first.last"
  password: string;
  preferred_modules: string[]; // ["Visual", "Aural", etc.]
  type: string | null; // "Unimodal", "Bimodal", etc.
}

export class StudentAPI {
  /**
   * Parse full name from "Last, First Middle" format
   */
  static parseName(fullName: string): {
    firstName: string;
    middleName?: string;
    lastName: string;
  } {
    // Split by comma
    const parts = fullName.split(',').map(p => p.trim());
    
    if (parts.length < 2) {
      // No comma, assume it's just first and last
      const nameParts = fullName.trim().split(' ');
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts[nameParts.length - 1] || '',
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined
      };
    }

    const lastName = parts[0];
    const remainingName = parts[1].trim().split(' ');
    
    const firstName = remainingName[0] || '';
    const middleName = remainingName.length > 1 
      ? remainingName.slice(1).join(' ') 
      : undefined;

    return { firstName, middleName, lastName };
  }

  /**
   * Map VARK module names to learning style
   */
  static mapLearningStyle(
    preferredModules: string[]
  ): 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic' | undefined {
    if (!preferredModules || preferredModules.length === 0) {
      return undefined;
    }

    // Map module names to our learning styles
    const moduleMap: Record<string, string> = {
      'Visual': 'visual',
      'Aural': 'auditory',
      'Read/Write': 'reading_writing',
      'Kinesthetic': 'kinesthetic'
    };

    // Get first valid module as primary learning style
    for (const module of preferredModules) {
      if (moduleMap[module]) {
        return moduleMap[module] as any;
      }
    }

    // Default to reading_writing if only general module
    return 'reading_writing';
  }

  /**
   * Create a single student
   */
  static async createStudent(data: StudentData) {
    try {
      console.log('Creating student:', data.email);

      // Generate email if not provided (from username)
      const email = data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@student.com`;

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: data.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: data.firstName,
            middle_name: data.middleName,
            last_name: data.lastName,
            role: 'student',
            learning_style: data.learningStyle,
            grade_level: data.gradeLevel
          }
        });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
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
        onboarding_completed: data.onboardingCompleted ?? true // Default true to bypass VARK
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
        throw new Error(profileError.message);
      }

      console.log('✅ Student created:', email);
      return { success: true, data: profile };
    } catch (error) {
      console.error('Error creating student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create student'
      };
    }
  }

  /**
   * Bulk import students from JSON
   */
  static async bulkImportStudents(students: BulkImportStudent[]) {
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    console.log(`📥 Starting bulk import of ${students.length} students...`);

    for (const student of students) {
      try {
        // Parse name
        const { firstName, middleName, lastName } = this.parseName(student.name);

        // Generate email from username
        const email = `${student.username}@student.com`;

        // Check if student already exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single();

        if (existing) {
          console.log(`⏭️ Skipping existing student: ${email}`);
          results.skipped++;
          continue;
        }

        // Map learning style
        const learningStyle = this.mapLearningStyle(student.preferred_modules);

        // Create student
        const result = await this.createStudent({
          email,
          password: student.password,
          firstName,
          middleName,
          lastName,
          fullName: student.name,
          learningStyle,
          preferredModules: student.preferred_modules || [],
          learningType: student.type ? student.type : undefined,
          gradeLevel: 'Grade 7', // Default grade level
          onboardingCompleted: true // Bypass VARK assessment
        });

        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${student.name}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${student.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log('📊 Bulk import results:', results);
    return results;
  }

  /**
   * Get all students
   */
  static async getStudents() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch students'
      };
    }
  }

  /**
   * Update student
   */
  static async updateStudent(id: string, updates: Partial<StudentData>) {
    try {
      const profileData: any = {};

      if (updates.firstName !== undefined)
        profileData.first_name = updates.firstName;
      if (updates.middleName !== undefined)
        profileData.middle_name = updates.middleName;
      if (updates.lastName !== undefined)
        profileData.last_name = updates.lastName;
      if (updates.fullName !== undefined)
        profileData.full_name = updates.fullName;
      if (updates.learningStyle !== undefined)
        profileData.learning_style = updates.learningStyle;
      if (updates.gradeLevel !== undefined)
        profileData.grade_level = updates.gradeLevel;
      if (updates.preferredModules !== undefined)
        profileData.preferred_modules = updates.preferredModules;
      if (updates.learningType !== undefined)
        profileData.learning_type = updates.learningType;
      if (updates.onboardingCompleted !== undefined)
        profileData.onboarding_completed = updates.onboardingCompleted;

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update password if provided
      if (updates.password) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          id,
          { password: updates.password }
        );

        if (passwordError) {
          console.warn('Password update failed:', passwordError);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update student'
      };
    }
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: string) {
    try {
      // Delete profile (cascade will handle other relations)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      // Delete auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

      if (authError) {
        console.warn('Auth user deletion failed:', authError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete student'
      };
    }
  }

  /**
   * Reset student password
   */
  static async resetStudentPassword(id: string, newPassword: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }
}
