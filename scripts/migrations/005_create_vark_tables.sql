-- =============================================
-- Migration 005: Create VARK Module Tables
-- =============================================
-- Description: Creates VARK learning module system tables
-- Dependencies: 001, 002, 003
-- Idempotent: Yes
-- =============================================

-- =============================================
-- Table: vark_module_categories
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_module_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  learning_style TEXT NOT NULL,
  icon_name TEXT,
  color_scheme TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vark_modules
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.vark_module_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  learning_objectives JSONB,
  content_structure JSONB,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER,
  prerequisites JSONB,
  multimedia_content JSONB,
  interactive_elements JSONB,
  assessment_questions JSONB,
  module_metadata JSONB,
  json_backup_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vark_module_sections
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_module_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'activity', 'assessment', 'quick_check', 'highlight', 'table', 'diagram')),
  content_data JSONB NOT NULL,
  position INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT TRUE,
  time_estimate_minutes INTEGER,
  learning_style_tags JSONB,
  interactive_elements JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vark_module_progress
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_section_id UUID REFERENCES public.vark_module_sections(id),
  time_spent_minutes INTEGER DEFAULT 0,
  completed_sections JSONB,
  assessment_scores JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- =============================================
-- Table: vark_module_assignments
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('student', 'class')),
  assigned_to_id UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  is_required BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vark_learning_paths
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  learning_style learning_style NOT NULL,
  module_sequence JSONB NOT NULL,
  total_duration_hours INTEGER,
  difficulty_progression TEXT CHECK (difficulty_progression IN ('linear', 'adaptive', 'branching')),
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vark_module_feedback
-- =============================================

CREATE TABLE IF NOT EXISTS public.vark_module_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- =============================================
-- Table: module_completions
-- =============================================

CREATE TABLE IF NOT EXISTS public.module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  final_score DECIMAL(5,2),
  time_spent_minutes INTEGER DEFAULT 0,
  perfect_sections INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- =============================================
-- Table: student_badges
-- =============================================

CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criteria_met JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: teacher_notifications
-- =============================================

CREATE TABLE IF NOT EXISTS public.teacher_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_module_id UUID REFERENCES public.vark_modules(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_vark_modules_category_id ON public.vark_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_vark_modules_created_by ON public.vark_modules(created_by);
CREATE INDEX IF NOT EXISTS idx_vark_modules_published ON public.vark_modules(is_published);
CREATE INDEX IF NOT EXISTS idx_vark_module_sections_module_id ON public.vark_module_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_vark_module_progress_student_module ON public.vark_module_progress(student_id, module_id);
CREATE INDEX IF NOT EXISTS idx_vark_module_progress_status ON public.vark_module_progress(status);
CREATE INDEX IF NOT EXISTS idx_vark_module_assignments_assigned_to ON public.vark_module_assignments(assigned_to_type, assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_vark_module_feedback_module_id ON public.vark_module_feedback(module_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_student_id ON public.module_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_notifications_teacher_id ON public.teacher_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_notifications_is_read ON public.teacher_notifications(is_read);

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 005 completed successfully';
    RAISE NOTICE 'Created VARK tables:';
    RAISE NOTICE '  - vark_module_categories, vark_modules, vark_module_sections';
    RAISE NOTICE '  - vark_module_progress, vark_module_assignments';
    RAISE NOTICE '  - vark_learning_paths, vark_module_feedback';
    RAISE NOTICE '  - module_completions, student_badges, teacher_notifications';
END $$;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
/*
DROP TABLE IF EXISTS public.teacher_notifications CASCADE;
DROP TABLE IF EXISTS public.student_badges CASCADE;
DROP TABLE IF EXISTS public.module_completions CASCADE;
DROP TABLE IF EXISTS public.vark_module_feedback CASCADE;
DROP TABLE IF EXISTS public.vark_learning_paths CASCADE;
DROP TABLE IF EXISTS public.vark_module_assignments CASCADE;
DROP TABLE IF EXISTS public.vark_module_progress CASCADE;
DROP TABLE IF EXISTS public.vark_module_sections CASCADE;
DROP TABLE IF EXISTS public.vark_modules CASCADE;
DROP TABLE IF EXISTS public.vark_module_categories CASCADE;
*/