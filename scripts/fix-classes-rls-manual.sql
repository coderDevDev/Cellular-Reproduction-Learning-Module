-- Manual Fix for Classes Table RLS Infinite Recursion
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop problematic policies
DROP POLICY IF EXISTS "Teachers can manage own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view all classes" ON public.classes;

-- Step 3: Create safe function to check teacher role
CREATE OR REPLACE FUNCTION public.is_teacher_safe(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Re-enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Step 5: Create new safe policies
CREATE POLICY "Teachers can manage own classes" ON public.classes
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

-- Step 6: Also fix other tables with similar issues
-- Lessons table
DROP POLICY IF EXISTS "Teachers can manage own lessons" ON public.lessons;
CREATE POLICY "Teachers can manage own lessons" ON public.lessons
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

-- Quizzes table
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can manage own quizzes" ON public.quizzes
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

-- Activities table
DROP POLICY IF EXISTS "Teachers can manage own activities" ON public.activities;
CREATE POLICY "Teachers can manage own activities" ON public.activities
  FOR ALL USING (
    assigned_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    assigned_by = auth.uid()
  );

-- Submissions table
DROP POLICY IF EXISTS "Teachers can view submissions for their activities" ON public.submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions for their activities" ON public.submissions;

CREATE POLICY "Teachers can view submissions for their activities" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = submissions.activity_id AND a.assigned_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions for their activities" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = submissions.activity_id AND a.assigned_by = auth.uid()
    )
  );

-- Quiz results table
DROP POLICY IF EXISTS "Teachers can view results for their quizzes" ON public.quiz_results;
CREATE POLICY "Teachers can view results for their quizzes" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_results.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Quiz assignees table
DROP POLICY IF EXISTS "Teachers manage quiz assignees for own quizzes" ON public.quiz_assignees;
CREATE POLICY "Teachers manage quiz assignees for own quizzes" ON public.quiz_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Quiz class assignees table
DROP POLICY IF EXISTS "Teachers manage class assignees for own quizzes" ON public.quiz_class_assignees;
CREATE POLICY "Teachers manage class assignees for own quizzes" ON public.quiz_class_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_class_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Quiz questions table
DROP POLICY IF EXISTS "Teachers manage questions for own quizzes" ON public.quiz_questions;
CREATE POLICY "Teachers manage questions for own quizzes" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Activity assignees table
DROP POLICY IF EXISTS "Teachers manage assignees for own activities" ON public.activity_assignees;
CREATE POLICY "Teachers manage assignees for own activities" ON public.activity_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_assignees.activity_id AND a.assigned_by = auth.uid()
    )
  );

-- Activity class assignees table
DROP POLICY IF EXISTS "Teachers manage class assignees for own activities" ON public.activity_class_assignees;
CREATE POLICY "Teachers manage class assignees for own activities" ON public.activity_class_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_class_assignees.activity_id AND a.assigned_by = auth.uid()
    )
  );

-- Success message
SELECT 'All table RLS infinite recursion issues fixed successfully!' as message;
