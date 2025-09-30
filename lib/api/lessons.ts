import { supabase } from '../supabase';
import { Lesson, CreateLessonData, UpdateLessonData } from '@/types/lesson';

export class LessonsAPI {
  // Get all lessons for a teacher
  static async getTeacherLessons(teacherId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(
          `
          *,
          lesson_progress(count),
          profiles!lessons_created_by_fkey(
            id,
            first_name,
            last_name,
            full_name
          )
        `
        )
        .eq('created_by', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(lesson => ({
        ...lesson,
        progress_count: lesson.lesson_progress?.[0]?.count || 0,
        teacher_name: lesson.profiles?.full_name || 'Unknown Teacher'
      }));
    } catch (error) {
      console.error('Error fetching teacher lessons:', error);
      throw error;
    }
  }

  // Get a single lesson by ID with full details
  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(
          `
          *,
          lesson_progress(
            student_id,
            status,
            completed_at,
            profiles!lesson_progress_student_id_fkey(
              id,
              first_name,
              last_name,
              full_name,
              learning_style
            )
          ),
          profiles!lessons_created_by_fkey(
            id,
            first_name,
            last_name,
            full_name
          )
        `
        )
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          progress_count: data.lesson_progress?.length || 0,
          teacher_name: data.profiles?.full_name || 'Unknown Teacher',
          student_progress:
            data.lesson_progress?.map(p => ({
              student_id: p.student_id,
              status: p.status,
              completed_at: p.completed_at,
              ...p.profiles
            })) || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      throw error;
    }
  }

  // Create a new lesson
  static async createLesson(lessonData: CreateLessonData): Promise<Lesson> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonData])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        progress_count: 0,
        teacher_name: 'Current User'
      };
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  // Update an existing lesson
  static async updateLesson(
    lessonId: string,
    updates: UpdateLessonData
  ): Promise<Lesson> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        progress_count: 0,
        teacher_name: 'Current User'
      };
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  }

  // Delete a lesson
  static async deleteLesson(lessonId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  // Publish/Unpublish a lesson
  static async toggleLessonPublish(
    lessonId: string,
    isPublished: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: isPublished })
        .eq('id', lessonId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling lesson publish status:', error);
      throw error;
    }
  }

  // Get lesson statistics
  static async getLessonStats(lessonId: string): Promise<any> {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(
          `
          *,
          lesson_progress(count),
          lesson_progress!inner(
            status,
            completed_at
          )
        `
        )
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      const totalStudents = lessonData.lesson_progress?.[0]?.count || 0;
      const completedStudents =
        lessonData.lesson_progress?.filter(p => p.status === 'completed')
          .length || 0;
      const inProgressStudents =
        lessonData.lesson_progress?.filter(p => p.status === 'in_progress')
          .length || 0;

      return {
        total_students: totalStudents,
        completed_students: completedStudents,
        in_progress_students: inProgressStudents,
        not_started_students:
          totalStudents - completedStudents - inProgressStudents,
        completion_rate:
          totalStudents > 0
            ? Math.round((completedStudents / totalStudents) * 100)
            : 0
      };
    } catch (error) {
      console.error('Error fetching lesson stats:', error);
      throw error;
    }
  }

  // Search lessons with filters
  static async searchLessons(
    teacherId: string,
    searchTerm: string,
    filters: any = {}
  ): Promise<Lesson[]> {
    try {
      let query = supabase
        .from('lessons')
        .select(
          `
          *,
          lesson_progress(count),
          profiles!lessons_created_by_fkey(
            id,
            first_name,
            last_name,
            full_name
          )
        `
        )
        .eq('created_by', teacherId);

      // Apply search
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject);
      }

      if (filters.grade_level && filters.grade_level !== 'all') {
        query = query.eq('grade_level', filters.grade_level);
      }

      if (filters.vark_tag && filters.vark_tag !== 'all') {
        query = query.eq('vark_tag', filters.vark_tag);
      }

      if (filters.resource_type && filters.resource_type !== 'all') {
        query = query.eq('resource_type', filters.resource_type);
      }

      if (filters.published !== undefined) {
        query = query.eq('is_published', filters.published);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) throw error;

      return data.map(lesson => ({
        ...lesson,
        progress_count: lesson.lesson_progress?.[0]?.count || 0,
        teacher_name: lesson.profiles?.full_name || 'Unknown Teacher'
      }));
    } catch (error) {
      console.error('Error searching lessons:', error);
      throw error;
    }
  }

  // Get lesson progress for a specific student
  static async getStudentLessonProgress(
    lessonId: string,
    studentId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      return data || null;
    } catch (error) {
      console.error('Error fetching student lesson progress:', error);
      throw error;
    }
  }

  // Update lesson progress for a student
  static async updateStudentProgress(
    lessonId: string,
    studentId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    completedAt?: string
  ): Promise<void> {
    try {
      const progressData = {
        lesson_id: lessonId,
        student_id: studentId,
        status,
        completed_at:
          status === 'completed'
            ? completedAt || new Date().toISOString()
            : null
      };

      // Try to update existing progress, insert if not exists
      const { error } = await supabase
        .from('lesson_progress')
        .upsert(progressData, { onConflict: 'lesson_id,student_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating student progress:', error);
      throw error;
    }
  }

  // Get lessons by learning style (for students)
  static async getLessonsByLearningStyle(
    learningStyle: string,
    subject?: string,
    gradeLevel?: string
  ): Promise<Lesson[]> {
    try {
      let query = supabase
        .from('lessons')
        .select('*')
        .eq('vark_tag', learningStyle)
        .eq('is_published', true);

      if (subject) {
        query = query.eq('subject', subject);
      }

      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching lessons by learning style:', error);
      throw error;
    }
  }
}
