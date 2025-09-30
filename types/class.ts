export interface Class {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  student_count: number;
  teacher_name: string;
  students?: ClassStudent[];
}

export interface ClassStudent {
  id: string;
  joined_at: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  learning_style?: string;
  grade_level?: string;
}

export interface CreateClassData {
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  created_by: string;
}

export interface UpdateClassData {
  name?: string;
  description?: string;
  subject?: string;
  grade_level?: string;
}

export interface ClassFilters {
  subject: string;
  grade_level: string;
  searchTerm: string;
}

export interface ClassStats {
  total_students: number;
  total_lessons: number;
  total_quizzes: number;
  total_activities: number;
}

export interface StudentEnrollment {
  student_id: string;
  class_id: string;
  joined_at: string;
}
