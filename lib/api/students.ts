import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
   * Uses server-side API route for secure admin operations
   */
  static async createStudent(data: StudentData) {
    try {
      console.log('Creating student:', data.email);

      // Call server-side API route (has access to service role key)
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student');
      }

      console.log('✅ Student created:', data.email);
      return { success: true, data: result.data };
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
   * Optimized: Uses server-side API route for secure admin operations
   */
  static async bulkImportStudents(students: BulkImportStudent[]) {
    try {
      console.log(`📥 Starting bulk import of ${students.length} students...`);

      // Call server-side API route (has access to service role key)
      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(students),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk import failed');
      }

      const results = await response.json();
      console.log('📊 Bulk import results:', results);
      return results;
    } catch (error) {
      console.error('Bulk import error:', error);
      return {
        success: 0,
        failed: students.length,
        skipped: 0,
        errors: [
          error instanceof Error ? error.message : 'Failed to import students',
        ],
      };
    }
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

      // TODO: Update password if provided (needs server-side API route)
      if (updates.password) {
        console.warn('⚠️ Password update requires server-side API route - feature disabled for now');
        // Will need to create /api/students/update-password route
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

      // TODO: Delete auth user (needs server-side API route)
      // Note: Auth user will be orphaned but won't affect functionality
      // since all app access is based on profiles table
      console.log('⚠️ Auth user deletion requires server-side API route - user orphaned in auth');

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
   * TODO: Needs server-side API route for secure admin operation
   */
  static async resetStudentPassword(id: string, newPassword: string) {
    console.error('⚠️ Password reset requires server-side API route - feature not implemented');
    return {
      success: false,
      error: 'Password reset feature requires server-side API route (security)'
    };
  }
}
