import { supabase } from '@/lib/supabase';

export interface TeacherDashboardStats {
  totalStudents: number;
  publishedModules: number;
  totalModules: number;
  completedModules: number;
}

export interface LearningStyleDistribution {
  visual: number;
  auditory: number;
  reading_writing: number;
  kinesthetic: number;
}

export interface LearningTypeDistribution {
  unimodal: number;
  bimodal: number;
  trimodal: number;
  multimodal: number;
  not_set: number;
}

export interface RecentCompletion {
  id: string;
  moduleTitle: string;
  studentName: string;
  completionDate: string;
  finalScore: number;
  timeSpentMinutes: number;
  perfectSections: number;
}

export class TeacherDashboardAPI {
  static async getDashboardStats(
    teacherId: string
  ): Promise<TeacherDashboardStats> {
    try {
      // Get total students (all students with role='student')
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Get published VARK modules created by this teacher
      const { data: publishedModules, error: publishedError } = await supabase
        .from('vark_modules')
        .select('id')
        .eq('created_by', teacherId)
        .eq('is_published', true);

      if (publishedError) throw publishedError;

      // Get total VARK modules created by this teacher
      const { data: totalModules, error: totalError } = await supabase
        .from('vark_modules')
        .select('id')
        .eq('created_by', teacherId);

      if (totalError) throw totalError;

      // Get completed modules count
      const { data: completions, error: completionsError } = await supabase
        .from('module_completions')
        .select(
          `
          id,
          vark_modules!inner(created_by)
        `
        )
        .eq('vark_modules.created_by', teacherId);

      if (completionsError) throw completionsError;

      return {
        totalStudents: students?.length || 0,
        publishedModules: publishedModules?.length || 0,
        totalModules: totalModules?.length || 0,
        completedModules: completions?.length || 0
      };
    } catch (error) {
      console.error('Error fetching teacher dashboard stats:', error);
      throw error;
    }
  }

  static async getLearningStyleDistribution(
    teacherId: string
  ): Promise<LearningStyleDistribution> {
    try {
      // Get all students with their learning styles
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, learning_style')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Count learning styles
      const distribution = {
        visual: 0,
        auditory: 0,
        reading_writing: 0,
        kinesthetic: 0
      };

      students?.forEach(student => {
        const learningStyle = student.learning_style;
        if (learningStyle && learningStyle in distribution) {
          distribution[learningStyle as keyof LearningStyleDistribution]++;
        }
      });

      return distribution;
    } catch (error) {
      console.error('Error fetching learning style distribution:', error);
      throw error;
    }
  }

  static async getLearningTypeDistribution(
    teacherId: string
  ): Promise<LearningTypeDistribution> {
    try {
      // Get all students with their learning types
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, learning_type')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Count learning types
      const distribution = {
        unimodal: 0,
        bimodal: 0,
        trimodal: 0,
        multimodal: 0,
        not_set: 0
      };

      students?.forEach(student => {
        const learningType = student.learning_type?.toLowerCase();
        if (learningType && learningType in distribution) {
          distribution[learningType as keyof Omit<LearningTypeDistribution, 'not_set'>]++;
        } else {
          distribution.not_set++;
        }
      });

      return distribution;
    } catch (error) {
      console.error('Error fetching learning type distribution:', error);
      throw error;
    }
  }

  static async getRecentCompletions(
    teacherId: string
  ): Promise<RecentCompletion[]> {
    try {
      // Get recent module completions for modules created by this teacher
      const { data: completions, error: completionsError } = await supabase
        .from('module_completions')
        .select(
          `
          id,
          student_id,
          module_id,
          completion_date,
          final_score,
          time_spent_minutes,
          perfect_sections,
          vark_modules!inner(
            id,
            title,
            created_by
          ),
          profiles!inner(
            id,
            first_name,
            last_name,
            full_name
          )
        `
        )
        .eq('vark_modules.created_by', teacherId)
        .order('completion_date', { ascending: false })
        .limit(10);

      if (completionsError) throw completionsError;

      // Format completions
      const recentCompletions: RecentCompletion[] = (completions || []).map(
        (completion: any) => {
          const studentName =
            completion.profiles?.full_name ||
            `${completion.profiles?.first_name || ''} ${
              completion.profiles?.last_name || ''
            }`.trim() ||
            'Unknown Student';

          return {
            id: completion.id,
            moduleTitle: completion.vark_modules?.title || 'Unknown Module',
            studentName,
            completionDate: completion.completion_date,
            finalScore: completion.final_score || 0,
            timeSpentMinutes: completion.time_spent_minutes || 0,
            perfectSections: completion.perfect_sections || 0
          };
        }
      );

      return recentCompletions;
    } catch (error) {
      console.error('Error fetching recent completions:', error);
      throw error;
    }
  }

  static async getStudentList(teacherId: string): Promise<any[]> {
    try {
      const { data: students, error } = await supabase
        .from('class_students')
        .select(
          `
          student_id,
          joined_at,
          classes!inner(
            id,
            name,
            subject,
            grade_level,
            created_by
          ),
          profiles!inner(
            id,
            first_name,
            last_name,
            full_name,
            email,
            grade_level,
            learning_style,
            onboarding_completed
          )
        `
        )
        .eq('classes.created_by', teacherId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return (
        students?.map(student => ({
          id: student.student_id,
          name:
            student.profiles?.full_name ||
            `${student.profiles?.first_name || ''} ${
              student.profiles?.last_name || ''
            }`.trim(),
          email: student.profiles?.email,
          gradeLevel: student.profiles?.grade_level,
          learningStyle: student.profiles?.learning_style,
          className: student.classes?.name,
          subject: student.classes?.subject,
          joinedAt: student.joined_at,
          onboardingCompleted: student.profiles?.onboarding_completed
        })) || []
      );
    } catch (error) {
      console.error('Error fetching student list:', error);
      throw error;
    }
  }
}
