import { supabase } from '@/lib/supabase';
import type { User } from '@/types/auth';

export interface DashboardStats {
  lessonsCompleted: number;
  totalLessons: number;
  quizAverage: number;
  activitiesSubmitted: number;
  totalActivities: number;
  totalTimeSpent: number; // in hours
}

export interface RecentActivity {
  id: string;
  type: 'lesson' | 'quiz' | 'activity';
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'urgent';
  timestamp: string;
  icon: string;
  color: string;
}

export interface ProgressData {
  lessons: { completed: number; total: number; percentage: number };
  quizzes: { average: number; totalTaken: number };
  activities: { submitted: number; total: number; percentage: number };
}

export class StudentDashboardAPI {
  /**
   * Get dashboard statistics for a student
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get lessons progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', userId);

      if (lessonError) {
        console.error('Error fetching lesson progress:', lessonError);
      }

      // Get quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('score, total_points')
        .eq('student_id', userId);

      if (quizError) {
        console.error('Error fetching quiz results:', quizError);
      }

      // Get activities and submissions
      const { data: activities, error: activityError } = await supabase
        .from('activities')
        .select(
          `
          id,
          submissions!inner(student_id, submitted_at)
        `
        )
        .eq('submissions.student_id', userId);

      if (activityError) {
        console.error('Error fetching activities:', activityError);
      }

      // Calculate statistics
      const lessonsCompleted =
        lessonProgress?.filter(p => p.status === 'completed').length || 0;
      const totalLessons = lessonProgress?.length || 0;

      const quizScores =
        quizResults?.map(q => (q.score / q.total_points) * 100) || [];
      const quizAverage =
        quizScores.length > 0
          ? Math.round(
              quizScores.reduce((a, b) => a + b, 0) / quizScores.length
            )
          : 0;

      const activitiesSubmitted = activities?.length || 0;
      const totalActivities = activities?.length || 0; // This should be total assigned activities

      // Calculate total time spent (placeholder - you can implement actual time tracking)
      const totalTimeSpent = Math.round(
        lessonsCompleted * 0.5 + quizScores.length * 0.25
      );

      return {
        lessonsCompleted,
        totalLessons,
        quizAverage,
        activitiesSubmitted,
        totalActivities,
        totalTimeSpent
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        lessonsCompleted: 0,
        totalLessons: 0,
        quizAverage: 0,
        activitiesSubmitted: 0,
        totalActivities: 0,
        totalTimeSpent: 0
      };
    }
  }

  /**
   * Get recent activities for a student
   */
  static async getRecentActivities(userId: string): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent lesson progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('lesson_progress')
        .select(
          `
          id,
          status,
          updated_at,
          lessons!inner(title)
        `
        )
        .eq('student_id', userId)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (!lessonError && lessonProgress) {
        lessonProgress.forEach(progress => {
          activities.push({
            id: progress.id,
            type: 'lesson',
            title: progress.lessons?.title || 'Unknown Lesson',
            status:
              progress.status === 'completed' ? 'completed' : 'in_progress',
            timestamp: progress.updated_at,
            icon: 'BookOpen',
            color: progress.status === 'completed' ? 'blue' : 'yellow'
          });
        });
      }

      // Get recent quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select(
          `
          id,
          submitted_at,
          quizzes!inner(title)
        `
        )
        .eq('student_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(2);

      if (!quizError && quizResults) {
        quizResults.forEach(result => {
          activities.push({
            id: result.id,
            type: 'quiz',
            title: result.quizzes?.title || 'Unknown Quiz',
            status: 'completed',
            timestamp: result.submitted_at,
            icon: 'FileText',
            color: 'green'
          });
        });
      }

      // Get recent activity submissions
      const { data: submissions, error: submissionError } = await supabase
        .from('submissions')
        .select(
          `
          id,
          submitted_at,
          activities!inner(title, deadline)
        `
        )
        .eq('student_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(2);

      if (!submissionError && submissions) {
        submissions.forEach(submission => {
          const deadline = new Date(submission.activities?.deadline || '');
          const now = new Date();
          const isUrgent =
            deadline < now &&
            deadline.getTime() > now.getTime() - 24 * 60 * 60 * 1000; // Due within 24 hours

          activities.push({
            id: submission.id,
            type: 'activity',
            title: submission.activities?.title || 'Unknown Activity',
            status: isUrgent ? 'urgent' : 'completed',
            timestamp: submission.submitted_at,
            icon: 'Activity',
            color: isUrgent ? 'red' : 'purple'
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
      // Get lessons progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('lesson_progress')
        .select('status')
        .eq('student_id', userId);

      const lessonsCompleted =
        lessonProgress?.filter(p => p.status === 'completed').length || 0;
      const totalLessons = lessonProgress?.length || 0;

      // Get quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('score, total_points')
        .eq('student_id', userId);

      const quizScores =
        quizResults?.map(q => (q.score / q.total_points) * 100) || [];
      const quizAverage =
        quizScores.length > 0
          ? Math.round(
              quizScores.reduce((a, b) => a + b, 0) / quizScores.length
            )
          : 0;

      // Get activities progress
      const { data: activities, error: activityError } = await supabase
        .from('activities')
        .select(
          `
          id,
          submissions!inner(student_id)
        `
        )
        .eq('submissions.student_id', userId);

      const activitiesSubmitted = activities?.length || 0;
      const totalActivities = activities?.length || 0;

      return {
        lessons: {
          completed: lessonsCompleted,
          total: totalLessons,
          percentage:
            totalLessons > 0
              ? Math.round((lessonsCompleted / totalLessons) * 100)
              : 0
        },
        quizzes: {
          average: quizAverage,
          totalTaken: quizScores.length
        },
        activities: {
          submitted: activitiesSubmitted,
          total: totalActivities,
          percentage:
            totalActivities > 0
              ? Math.round((activitiesSubmitted / totalActivities) * 100)
              : 0
        }
      };
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return {
        lessons: { completed: 0, total: 0, percentage: 0 },
        quizzes: { average: 0, totalTaken: 0 },
        activities: { submitted: 0, total: 0, percentage: 0 }
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






