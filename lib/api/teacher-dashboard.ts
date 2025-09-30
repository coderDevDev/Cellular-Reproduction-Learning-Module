import { supabase } from '@/lib/supabase';

export interface TeacherDashboardStats {
  totalStudents: number;
  activeLessons: number;
  quizzesCreated: number;
  pendingGrades: number;
}

export interface LearningStyleDistribution {
  visual: number;
  auditory: number;
  reading_writing: number;
  kinesthetic: number;
}

export interface RecentSubmission {
  id: string;
  title: string;
  studentName: string;
  type: 'activity' | 'quiz';
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
}

export interface QuickAccessData {
  totalClasses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalActivities: number;
}

export class TeacherDashboardAPI {
  static async getDashboardStats(
    teacherId: string
  ): Promise<TeacherDashboardStats> {
    try {
      // Get total students (students enrolled in classes created by this teacher)
      const { data: students, error: studentsError } = await supabase
        .from('class_students')
        .select(
          `
          student_id,
          classes!inner(created_by)
        `
        )
        .eq('classes.created_by', teacherId);

      if (studentsError) throw studentsError;

      // Get active lessons (published lessons created by this teacher)
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, is_published')
        .eq('created_by', teacherId)
        .eq('is_published', true);

      if (lessonsError) throw lessonsError;

      // Get quizzes created by this teacher
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('created_by', teacherId);

      if (quizzesError) throw quizzesError;

      // Get pending grades (submissions that haven't been graded yet)
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select(
          `
          id,
          activities!inner(assigned_by)
        `
        )
        .eq('activities.assigned_by', teacherId)
        .is('score', null);

      if (submissionsError) throw submissionsError;

      return {
        totalStudents: students?.length || 0,
        activeLessons: lessons?.length || 0,
        quizzesCreated: quizzes?.length || 0,
        pendingGrades: submissions?.length || 0
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
      // Get students enrolled in classes created by this teacher
      const { data: students, error: studentsError } = await supabase
        .from('class_students')
        .select(
          `
          student_id,
          classes!inner(created_by),
          profiles!inner(learning_style)
        `
        )
        .eq('classes.created_by', teacherId);

      if (studentsError) throw studentsError;

      // Count learning styles
      const distribution = {
        visual: 0,
        auditory: 0,
        reading_writing: 0,
        kinesthetic: 0
      };

      students?.forEach(student => {
        const learningStyle = student.profiles?.learning_style;
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

  static async getRecentSubmissions(
    teacherId: string
  ): Promise<RecentSubmission[]> {
    try {
      // Get recent activity submissions with student names
      const { data: activitySubmissions, error: activityError } = await supabase
        .from('submissions')
        .select(
          `
          id,
          submitted_at,
          score,
          student_id,
          activities!inner(
            id,
            title,
            assigned_by
          )
        `
        )
        .eq('activities.assigned_by', teacherId)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      // Get recent quiz results with student names
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select(
          `
          id,
          submitted_at,
          score,
          total_points,
          student_id,
          quizzes!inner(
            id,
            title,
            created_by
          )
        `
        )
        .eq('quizzes.created_by', teacherId)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (quizError) throw quizError;

      // Get student names for all submissions
      const studentIds = new Set<string>();
      activitySubmissions?.forEach(sub => studentIds.add(sub.student_id));
      quizResults?.forEach(result => studentIds.add(result.student_id));

      // Fetch student profiles in a single query
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name')
        .in('id', Array.from(studentIds));

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const studentProfilesMap = new Map(
        studentProfiles?.map(profile => [profile.id, profile]) || []
      );

      // Combine and format submissions
      const submissions: RecentSubmission[] = [];

      // Add activity submissions
      activitySubmissions?.forEach(submission => {
        const studentProfile = studentProfilesMap.get(submission.student_id);
        const studentName =
          studentProfile?.full_name ||
          `${studentProfile?.first_name || ''} ${
            studentProfile?.last_name || ''
          }`.trim();

        submissions.push({
          id: submission.id,
          title: submission.activities?.title || 'Unknown Activity',
          studentName,
          type: 'activity',
          submittedAt: submission.submitted_at,
          status: submission.score !== null ? 'graded' : 'pending',
          score: submission.score || undefined
        });
      });

      // Add quiz results
      quizResults?.forEach(result => {
        const studentProfile = studentProfilesMap.get(result.student_id);
        const studentName =
          studentProfile?.full_name ||
          `${studentProfile?.first_name || ''} ${
            studentProfile?.last_name || ''
          }`.trim();

        submissions.push({
          id: result.id,
          title: result.quizzes?.title || 'Unknown Quiz',
          studentName,
          type: 'quiz',
          submittedAt: result.submitted_at,
          status: 'graded',
          score: result.score
        });
      });

      // Sort by submission date and return top 10
      return submissions
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        )
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
      throw error;
    }
  }

  static async getQuickAccessData(teacherId: string): Promise<QuickAccessData> {
    try {
      // Get total classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('created_by', teacherId);

      if (classesError) throw classesError;

      // Get total lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('created_by', teacherId);

      if (lessonsError) throw lessonsError;

      // Get total quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('created_by', teacherId);

      if (quizzesError) throw quizzesError;

      // Get total activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id')
        .eq('assigned_by', teacherId);

      if (activitiesError) throw activitiesError;

      return {
        totalClasses: classes?.length || 0,
        totalLessons: lessons?.length || 0,
        totalQuizzes: quizzes?.length || 0,
        totalActivities: activities?.length || 0
      };
    } catch (error) {
      console.error('Error fetching quick access data:', error);
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
