-- =============================================
-- Migration 004: Create LMS Core Tables
-- =============================================
-- Description: Creates Learning Management System tables
-- Dependencies: 001, 002, 003
-- Idempotent: Yes
-- =============================================

-- =============================================
-- Table: classes
-- =============================================

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: class_students (enrollments)
-- =============================================

CREATE TABLE IF NOT EXISTS public.class_students (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- =============================================
-- Table: lessons
-- =============================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_url TEXT NOT NULL,
  subject TEXT,
  grade_level TEXT,
  vark_tag learning_style,
  resource_type TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: lesson_progress
-- =============================================

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, student_id)
);

-- =============================================
-- Table: quizzes
-- =============================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type quiz_type NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: quiz_questions
-- =============================================

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB,
  correct_answer JSONB,
  points INTEGER DEFAULT 1,
  position INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: quiz_assignees (student-level)
-- =============================================

CREATE TABLE IF NOT EXISTS public.quiz_assignees (
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (quiz_id, student_id)
);

-- =============================================
-- Table: quiz_class_assignees (class-level)
-- =============================================

CREATE TABLE IF NOT EXISTS public.quiz_class_assignees (
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (quiz_id, class_id)
);

-- =============================================
-- Table: quiz_results
-- =============================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  total_points INTEGER NOT NULL,
  responses JSONB,
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (quiz_id, student_id, attempt_number)
);

-- =============================================
-- Table: activities (assignments/projects)
-- =============================================

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  rubric_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  grading_mode TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: activity_assignees (student-level)
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_assignees (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (activity_id, student_id)
);

-- =============================================
-- Table: activity_class_assignees (class-level)
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_class_assignees (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (activity_id, class_id)
);

-- =============================================
-- Table: submissions
-- =============================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score DECIMAL(10,2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (activity_id, student_id)
);

-- =============================================
-- Table: announcements
-- =============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role user_role,
  target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_classes_created_by ON public.classes(created_by);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_created_by ON public.lessons(created_by);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_vark_tag ON public.lessons(vark_tag);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_assignees_student_id ON public.quiz_assignees(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_class_assignees_class_id ON public.quiz_class_assignees(class_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_student ON public.quiz_results(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_by ON public.activities(assigned_by);
CREATE INDEX IF NOT EXISTS idx_activity_assignees_student_id ON public.activity_assignees(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_class_assignees_class_id ON public.activity_class_assignees(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_activity_student ON public.submissions(activity_id, student_id);

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 004 completed successfully';
    RAISE NOTICE 'Created LMS tables:';
    RAISE NOTICE '  - classes, class_students';
    RAISE NOTICE '  - lessons, lesson_progress';
    RAISE NOTICE '  - quizzes, quiz_questions, quiz_assignees, quiz_class_assignees, quiz_results';
    RAISE NOTICE '  - activities, activity_assignees, activity_class_assignees, submissions';
    RAISE NOTICE '  - announcements';
END $$;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
/*
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.activity_class_assignees CASCADE;
DROP TABLE IF EXISTS public.activity_assignees CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.quiz_class_assignees CASCADE;
DROP TABLE IF EXISTS public.quiz_assignees CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.class_students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
*/