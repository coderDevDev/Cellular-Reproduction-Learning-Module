import { supabaseAdmin } from '@/lib/supabase';

export interface HomepageStats {
  totalStudents: number;
  totalTeachers: number;
  totalModules: number;
  successRate: number;
  recentActivity: {
    newStudents: number;
    newTeachers: number;
    completedModules: number;
  };
}

export class StatsAPI {
  static async getHomepageStats(): Promise<{
    success: boolean;
    data?: HomepageStats;
    error?: string;
  }> {
    try {
      console.log('Fetching homepage statistics...');

      // Fetch all statistics in parallel for better performance
      const [
        studentsResult,
        teachersResult,
        modulesResult,
        completedModulesResult,
        recentStudentsResult,
        recentTeachersResult
      ] = await Promise.all([
        // Total students
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'student'),

        // Total teachers
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'teacher'),

        // Total modules
        supabaseAdmin
          .from('vark_modules')
          .select('id', { count: 'exact' })
          .eq('is_published', true),

        // Completed modules (students with onboarding completed)
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'student')
          .eq('onboarding_completed', true),

        // Recent students (last 30 days)
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'student')
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ),

        // Recent teachers (last 30 days)
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'teacher')
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          )
      ]);

      // Check for errors
      const errors = [
        studentsResult.error,
        teachersResult.error,
        modulesResult.error,
        completedModulesResult.error,
        recentStudentsResult.error,
        recentTeachersResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Error fetching stats:', errors);
        return {
          success: false,
          error: 'Failed to fetch statistics from database'
        };
      }

      // Extract counts
      const totalStudents = studentsResult.count || 0;
      const totalTeachers = teachersResult.count || 0;
      const totalModules = modulesResult.count || 0;
      const completedModules = completedModulesResult.count || 0;
      const recentStudents = recentStudentsResult.count || 0;
      const recentTeachers = recentTeachersResult.count || 0;

      // Calculate success rate (percentage of students who completed onboarding)
      const successRate =
        totalStudents > 0
          ? Math.round((completedModules / totalStudents) * 100)
          : 0;

      const stats: HomepageStats = {
        totalStudents,
        totalTeachers,
        totalModules,
        successRate,
        recentActivity: {
          newStudents: recentStudents,
          newTeachers: recentTeachers,
          completedModules: completedModules
        }
      };

      console.log('Homepage stats fetched successfully:', stats);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in getHomepageStats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getSystemHealth(): Promise<{
    success: boolean;
    data?: {
      databaseConnected: boolean;
      lastUpdate: string;
      totalUsers: number;
    };
    error?: string;
  }> {
    try {
      // Simple health check
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact' })
        .limit(1);

      if (error) {
        return {
          success: false,
          error: 'Database connection failed'
        };
      }

      return {
        success: true,
        data: {
          databaseConnected: true,
          lastUpdate: new Date().toISOString(),
          totalUsers: data?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}
