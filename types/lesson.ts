export interface Lesson {
  id: string;
  title: string;
  content_url: string;
  subject: string;
  grade_level: string;
  vark_tag: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  resource_type: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  progress_count: number;
  teacher_name: string;
  student_progress?: LessonProgress[];
}

export interface LessonProgress {
  student_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  learning_style?: string;
}

export interface CreateLessonData {
  title: string;
  content_url: string;
  subject: string;
  grade_level: string;
  vark_tag: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  resource_type: string;
  is_published: boolean;
  created_by: string;
}

export interface UpdateLessonData {
  title?: string;
  content_url?: string;
  subject?: string;
  grade_level?: string;
  vark_tag?: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  resource_type?: string;
  is_published?: boolean;
}

export interface LessonFilters {
  subject: string;
  grade_level: string;
  vark_tag: string;
  resource_type: string;
  published: string;
  searchTerm: string;
}

export interface LessonStats {
  total_students: number;
  completed_students: number;
  in_progress_students: number;
  not_started_students: number;
  completion_rate: number;
}

export interface FileUploadData {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface LessonFormData {
  title: string;
  subject: string;
  grade_level: string;
  vark_tag: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  resource_type: string;
  content_url: string;
  is_published: boolean;
}
