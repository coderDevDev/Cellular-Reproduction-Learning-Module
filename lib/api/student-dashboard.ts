import { supabase } from '@/lib/supabase';
import type { User } from '@/types/auth';

export interface DashboardStats {
  modulesCompleted: number;
  modulesInProgress: number;
  averageScore: number;
  totalTimeSpent: number; // in minutes
  perfectSections: number;
  totalModulesAvailable: number;
}

export interface RecentActivity {
  id: string;
  type: 'module_completion' | 'module_progress';
  title: string;
  status: 'completed' | 'in_progress';
  timestamp: string;
  icon: string;
  color: string;
  score?: number;
  progress?: number;
}

export interface ProgressData {
  modules: { completed: number; inProgress: number; total: number; percentage: number };
  averageScore: number;
  totalTimeSpent: number;
  perfectSections: number;
}

export class StudentDashboardAPI {
  /**
   * Get dashboard statistics for a student
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get completed modules
      const { data: completions, error: completionsError } = await supabase
        .from('module_completions')
        .select('final_score, time_spent_minutes, perfect_sections')
        .eq('student_id', userId);

      if (completionsError) {
        console.warn('⚠️ Could not fetch module completions:', completionsError.message || completionsError);
      }

      // Get modules in progress
      const { data: progress, error: progressError } = await supabase
        .from('vark_module_progress')
        .select('id, progress_percentage')
        .eq('student_id', userId)
        .lt('progress_percentage', 100);

      if (progressError) {
        console.warn('⚠️ Could not fetch module progress:', progressError.message || progressError);
        console.log('This is normal if you haven\'t started any modules yet.');
      }

      // Get total available modules
      const { data: allModules, error: modulesError } = await supabase
        .from('vark_modules')
        .select('id')
        .eq('is_published', true);

      if (modulesError) {
        console.warn('⚠️ Could not fetch available modules:', modulesError.message || modulesError);
      }

      // Calculate statistics
      const modulesCompleted = completions?.length || 0;
      const modulesInProgress = progress?.length || 0;
      const totalModulesAvailable = allModules?.length || 0;

      const scores = completions?.map(c => c.final_score) || [];
      const averageScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      const totalTimeSpent =
        completions?.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0) || 0;

      const perfectSections =
        completions?.reduce((sum, c) => sum + (c.perfect_sections || 0), 0) || 0;

      return {
        modulesCompleted,
        modulesInProgress,
        averageScore,
        totalTimeSpent,
        perfectSections,
        totalModulesAvailable
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        modulesCompleted: 0,
        modulesInProgress: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        perfectSections: 0,
        totalModulesAvailable: 0
      };
    }
  }

  /**
   * Get recent activities for a student
   */
  static async getRecentActivities(userId: string): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent module completions
      const { data: completions, error: completionsError } = await supabase
        .from('module_completions')
        .select(
          `
          id,
          completion_date,
          final_score,
          vark_modules!inner(title)
        `
        )
        .eq('student_id', userId)
        .order('completion_date', { ascending: false })
        .limit(3);

      if (!completionsError && completions) {
        completions.forEach(completion => {
          activities.push({
            id: completion.id,
            type: 'module_completion',
            title: completion.vark_modules?.title || 'Unknown Module',
            status: 'completed',
            timestamp: completion.completion_date,
            icon: 'CheckCircle',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            score: completion.final_score
          });
        });
      }

      // Get recent module progress (in progress modules)
      const { data: progress, error: progressError } = await supabase
        .from('vark_module_progress')
        .select(
          `
          id,
          updated_at,
          progress_percentage,
          vark_modules!inner(title)
        `
        )
        .eq('student_id', userId)
        .lt('progress_percentage', 100)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (!progressError && progress) {
        progress.forEach(prog => {
          activities.push({
            id: prog.id,
            type: 'module_progress',
            title: prog.vark_modules?.title || 'Unknown Module',
            status: 'in_progress',
            timestamp: prog.updated_at,
            icon: 'Clock',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            progress: prog.progress_percentage
          });
        });
      }

      // Sort by timestamp and return top 5
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get progress data for charts
   */
  static async getProgressData(userId: string): Promise<ProgressData> {
    try {
      // Get completed modules
      const { data: completions, error: completionsError } = await supabase
        .from('module_completions')
        .select('final_score, time_spent_minutes, perfect_sections')
        .eq('student_id', userId);

      // Get modules in progress
      const { data: progress, error: progressError } = await supabase
        .from('vark_module_progress')
        .select('id')
        .eq('student_id', userId)
        .lt('progress_percentage', 100);

      // Get total available modules
      const { data: allModules, error: modulesError } = await supabase
        .from('vark_modules')
        .select('id')
        .eq('is_published', true);

      const modulesCompleted = completions?.length || 0;
      const modulesInProgress = progress?.length || 0;
      const totalModules = allModules?.length || 0;

      const scores = completions?.map(c => c.final_score) || [];
      const averageScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      const totalTimeSpent =
        completions?.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0) || 0;

      const perfectSections =
        completions?.reduce((sum, c) => sum + (c.perfect_sections || 0), 0) || 0;

      return {
        modules: {
          completed: modulesCompleted,
          inProgress: modulesInProgress,
          total: totalModules,
          percentage:
            totalModules > 0
              ? Math.round((modulesCompleted / totalModules) * 100)
              : 0
        },
        averageScore,
        totalTimeSpent,
        perfectSections
      };
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return {
        modules: { completed: 0, inProgress: 0, total: 0, percentage: 0 },
        averageScore: 0,
        totalTimeSpent: 0,
        perfectSections: 0
      };
    }
  }

  /**
   * Get assigned lessons for a student
   */
  static async getAssignedLessons(userId: string): Promise<any[]> {
    try {
      // This would typically involve checking class enrollments and lesson assignments
      // For now, returning a placeholder
      return [];
    } catch (error) {
      console.error('Error fetching assigned lessons:', error);
      return [];
    }
  }

  /**
   * Get upcoming deadlines
   */
  static async getUpcomingDeadlines(userId: string): Promise<any[]> {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select(
          `
          id,
          title,
          deadline,
          submissions!inner(student_id)
        `
        )
        .eq('submissions.student_id', userId)
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching upcoming deadlines:', error);
        return [];
      }

      return activities || [];
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      return [];
    }
  }
}






