-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_url TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  vark_tag TEXT NOT NULL CHECK (vark_tag IN ('visual', 'auditory', 'reading_writing', 'kinesthetic')),
  resource_type TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (lesson_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_created_by ON public.lessons(created_by);
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON public.lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_grade_level ON public.lessons(grade_level);
CREATE INDEX IF NOT EXISTS idx_lessons_vark_tag ON public.lessons(vark_tag);
CREATE INDEX IF NOT EXISTS idx_lessons_is_published ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_id ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON public.lesson_progress(status);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is a student
CREATE OR REPLACE FUNCTION public.is_student_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for lessons table
-- Teachers can view, create, update, and delete their own lessons
CREATE POLICY "Teachers can view their own lessons" ON public.lessons
  FOR SELECT USING (
    is_teacher_safe() AND created_by = auth.uid()
  );

CREATE POLICY "Teachers can create their own lessons" ON public.lessons
  FOR INSERT WITH CHECK (
    is_teacher_safe() AND created_by = auth.uid()
  );

CREATE POLICY "Teachers can update their own lessons" ON public.lessons
  FOR UPDATE USING (
    is_teacher_safe() AND created_by = auth.uid()
  );

CREATE POLICY "Teachers can delete their own lessons" ON public.lessons
  FOR DELETE USING (
    is_teacher_safe() AND created_by = auth.uid()
  );

-- Students can view published lessons
CREATE POLICY "Students can view published lessons" ON public.lessons
  FOR SELECT USING (
    is_student_safe() AND is_published = true
  );

-- RLS Policies for lesson_progress table
-- Teachers can view progress for their own lessons
CREATE POLICY "Teachers can view progress for their lessons" ON public.lesson_progress
  FOR SELECT USING (
    is_teacher_safe() AND EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE id = lesson_progress.lesson_id AND created_by = auth.uid()
    )
  );

-- Students can view their own progress
CREATE POLICY "Students can view their own progress" ON public.lesson_progress
  FOR SELECT USING (
    is_student_safe() AND student_id = auth.uid()
  );

-- Students can update their own progress
CREATE POLICY "Students can update their own progress" ON public.lesson_progress
  FOR UPDATE USING (
    is_student_safe() AND student_id = auth.uid()
  );

-- Students can insert their own progress
CREATE POLICY "Students can insert their own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (
    is_student_safe() AND student_id = auth.uid()
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample subjects and grade levels if they don't exist
-- (This is optional, as the application will handle these dynamically)

COMMENT ON TABLE public.lessons IS 'Educational lessons created by teachers';
COMMENT ON TABLE public.lesson_progress IS 'Student progress tracking for lessons';
COMMENT ON COLUMN public.lessons.vark_tag IS 'Learning style tag: visual, auditory, reading_writing, kinesthetic';
COMMENT ON COLUMN public.lessons.resource_type IS 'Type of learning resource: Video, Document, Presentation, etc.';
COMMENT ON COLUMN public.lesson_progress.status IS 'Student progress status: not_started, in_progress, completed';
