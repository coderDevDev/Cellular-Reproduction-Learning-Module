import { supabase } from '../supabase';
import {
  Class,
  ClassStudent,
  CreateClassData,
  UpdateClassData
} from '@/types/class';

export class ClassesAPI {
  // Get all classes for a teacher
  static async getTeacherClasses(teacherId: string): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(
          `
          *,
          class_students(
            student_id,
            joined_at,
            profiles!class_students_student_id_fkey(
              id,
              first_name,
              last_name,
              full_name,
              email,
              learning_style,
              grade_level
            )
          ),
          profiles!classes_created_by_fkey(
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

      return data.map(cls => ({
        ...cls,
        student_count: cls.class_students?.length || 0,
        teacher_name: cls.profiles?.full_name || 'Unknown Teacher',
        students:
          cls.class_students?.map((cs: any) => ({
            id: cs.student_id,
            joined_at: cs.joined_at,
            ...cs.profiles
          })) || []
      }));
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      throw error;
    }
  }

  // Get a single class by ID with full details
  static async getClassById(classId: string): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(
          `
          *,
          class_students(
            student_id,
            joined_at,
            profiles!class_students_student_id_fkey(
              id,
              first_name,
              last_name,
              full_name,
              email,
              learning_style,
              grade_level
            )
          ),
          profiles!classes_created_by_fkey(
            id,
            first_name,
            last_name,
            full_name
          )
        `
        )
        .eq('id', classId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          student_count: data.class_students?.length || 0,
          teacher_name: data.profiles?.full_name || 'Unknown Teacher',
          students:
            data.class_students?.map((cs: any) => ({
              id: cs.student_id,
              joined_at: cs.joined_at,
              ...cs.profiles
            })) || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching class by ID:', error);
      throw error;
    }
  }

  // Create a new class
  static async createClass(classData: CreateClassData): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        student_count: 0,
        teacher_name: 'Current User'
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  // Update an existing class
  static async updateClass(
    classId: string,
    updates: UpdateClassData
  ): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        student_count: 0,
        teacher_name: 'Current User'
      };
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // Delete a class
  static async deleteClass(classId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Add students to a class
  static async addStudentsToClass(
    classId: string,
    studentIds: string[]
  ): Promise<void> {
    try {
      const classStudents = studentIds.map(studentId => ({
        class_id: classId,
        student_id: studentId
      }));

      const { error } = await supabase
        .from('class_students')
        .insert(classStudents);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding students to class:', error);
      throw error;
    }
  }

  // Remove students from a class
  static async removeStudentsFromClass(
    classId: string,
    studentIds: string[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .in('student_id', studentIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing students from class:', error);
      throw error;
    }
  }

  // Get available students (not enrolled in the class)
  static async getAvailableStudents(
    classId: string,
    teacherId: string
  ): Promise<any[]> {
    try {
      // For now, get all students (since we don't have a direct relationship)
      // In a real system, you might want to add a teacher_id to profiles or create a teacher_students table
      const { data: allStudents, error: studentsError } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, full_name, email, grade_level, learning_style'
        )
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Get students already enrolled in this specific class
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      if (enrolledError) throw enrolledError;

      const enrolledIds = enrolledStudents.map(es => es.student_id);

      // Filter out already enrolled students
      const availableStudents = allStudents.filter(
        student => !enrolledIds.includes(student.id)
      );

      return availableStudents;
    } catch (error) {
      console.error('Error fetching available students:', error);
      throw error;
    }
  }

  // Get classes that a student is enrolled in
  static async getStudentClasses(studentId: string): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select(
          `
          class_id,
          joined_at,
          classes!class_students_class_id_fkey(
            *,
            profiles!classes_created_by_fkey(
              id,
              first_name,
              last_name,
              full_name
            ),
            class_students(
              student_id,
              profiles!class_students_student_id_fkey(
                id,
                first_name,
                last_name,
                full_name,
                email,
                learning_style,
                grade_level
              )
            )
          )
        `
        )
        .eq('student_id', studentId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return data
        .map((enrollment: any) => {
          const classData = enrollment.classes;
          if (!classData) return null;

          return {
            id: classData.id,
            name: classData.name,
            description: classData.description,
            subject: classData.subject,
            grade_level: classData.grade_level,
            created_by: classData.created_by,
            created_at: classData.created_at,
            updated_at: classData.updated_at,
            student_count: classData.class_students?.length || 0,
            teacher_name: classData.profiles?.full_name || 'Unknown Teacher',
            students:
              classData.class_students?.map((cs: any) => ({
                id: cs.student_id,
                joined_at: cs.joined_at,
                first_name: cs.profiles?.first_name || '',
                last_name: cs.profiles?.last_name || '',
                full_name: cs.profiles?.full_name || '',
                email: cs.profiles?.email || '',
                learning_style: cs.profiles?.learning_style || '',
                grade_level: cs.profiles?.grade_level || ''
              })) || []
          };
        })
        .filter(Boolean) as Class[];
    } catch (error) {
      console.error('Error fetching student classes:', error);
      throw error;
    }
  }

  static async getStudentClassDetails(
    classId: string,
    studentId: string
  ): Promise<any> {
    try {
      // First check if student is enrolled in this class
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .single();

      if (enrollmentError || !enrollment) {
        throw new Error('Student not enrolled in this class');
      }

      // Get detailed class information
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(
          `
          *,
          profiles!classes_created_by_fkey(
            id,
            first_name,
            last_name,
            full_name,
            email
          ),
          class_students(
            student_id,
            joined_at,
            profiles!class_students_student_id_fkey(
              id,
              first_name,
              last_name,
              full_name,
              email,
              learning_style,
              grade_level,
              profile_photo
            )
          )
        `
        )
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      // Get VARK modules for this class
      const { data: modules, error: modulesError } = await supabase
        .from('vark_modules')
        .select(
          `
          *,
          category: vark_module_categories(*)
        `
        )
        .eq('target_class_id', classId)
        .eq('is_published', true);

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
      }

      // Get student's progress for modules in this class
      const { data: progress, error: progressError } = await supabase
        .from('vark_module_progress')
        .select('*')
        .eq('student_id', studentId)
        .in('module_id', modules?.map(m => m.id) || []);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      return {
        class: {
          id: classData.id,
          name: classData.name,
          description: classData.description,
          subject: classData.subject,
          grade_level: classData.grade_level,
          created_at: classData.created_at,
          updated_at: classData.updated_at,
          teacher: {
            id: classData.profiles?.id,
            name: classData.profiles?.full_name || 'Unknown Teacher',
            email: classData.profiles?.email
          },
          students:
            classData.class_students?.map((cs: any) => ({
              id: cs.student_id,
              joined_at: cs.joined_at,
              first_name: cs.profiles?.first_name || '',
              last_name: cs.profiles?.last_name || '',
              full_name: cs.profiles?.full_name || '',
              email: cs.profiles?.email || '',
              learning_style: cs.profiles?.learning_style || '',
              grade_level: cs.profiles?.grade_level || '',
              profile_photo: cs.profiles?.profile_photo
            })) || [],
          student_count: classData.class_students?.length || 0
        },
        modules: modules || [],
        progress: progress || [],
        enrollment: {
          joined_at: enrollment.joined_at
        }
      };
    } catch (error) {
      console.error('Error fetching class details:', error);
      throw error;
    }
  }

  // Get class statistics
  static async getClassStats(classId: string): Promise<any> {
    try {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(
          `
          *,
          class_students(count),
          lessons(count),
          quizzes(count),
          activities(count)
        `
        )
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      return {
        total_students: classData.class_students?.[0]?.count || 0,
        total_lessons: classData.lessons?.[0]?.count || 0,
        total_quizzes: classData.quizzes?.[0]?.count || 0,
        total_activities: classData.activities?.[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching class stats:', error);
      throw error;
    }
  }

  // Search classes
  static async searchClasses(
    teacherId: string,
    searchTerm: string,
    filters: any = {}
  ): Promise<Class[]> {
    try {
      let query = supabase
        .from('classes')
        .select(
          `
          *,
          class_students(count),
          profiles!classes_created_by_fkey(
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
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject);
      }

      if (filters.grade_level && filters.grade_level !== 'all') {
        query = query.eq('grade_level', filters.grade_level);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) throw error;

      return data.map(cls => ({
        ...cls,
        student_count: cls.class_students?.[0]?.count || 0,
        teacher_name: cls.profiles?.full_name || 'Unknown Teacher'
      }));
    } catch (error) {
      console.error('Error searching classes:', error);
      throw error;
    }
  }
}
