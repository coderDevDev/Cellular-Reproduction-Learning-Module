-- Fix Classes Table RLS Infinite Recursion
-- This script fixes the infinite recursion issue in the classes table RLS policies

-- 1. Disable RLS temporarily on classes table
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies for classes table
DROP POLICY IF EXISTS "Service role can manage all classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage own classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;

-- 3. Create a SECURITY DEFINER function to safely check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher_safe(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS and avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-enable RLS on classes table
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 5. Create new policies using the safe function
CREATE POLICY "Service role can manage all classes" ON public.classes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own classes" ON public.classes
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_students cs
      WHERE cs.class_id = classes.id AND cs.student_id = auth.uid()
    )
  );

-- 6. Also fix the class_students table policies that might have similar issues
DROP POLICY IF EXISTS "Teachers manage enrollments for own classes" ON public.class_students;

CREATE POLICY "Teachers manage enrollments for own classes" ON public.class_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_students.class_id AND c.created_by = auth.uid()
    )
  );

-- 7. Fix lessons table policies that also reference profiles
DROP POLICY IF EXISTS "Teachers can manage own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can view all lessons" ON public.lessons;

CREATE POLICY "Teachers can manage own lessons" ON public.lessons
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Teachers can view all lessons" ON public.lessons
  FOR SELECT USING (public.is_teacher_safe(auth.uid()));

-- 8. Fix quizzes table policies
DROP POLICY IF EXISTS "Teachers can manage own quizzes" ON public.quizzes;

CREATE POLICY "Teachers can manage own quizzes" ON public.quizzes
  FOR ALL USING (
    created_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    created_by = auth.uid()
  );

-- 9. Fix activities table policies
DROP POLICY IF EXISTS "Teachers can manage own activities" ON public.activities;

CREATE POLICY "Teachers can manage own activities" ON public.activities
  FOR ALL USING (
    assigned_by = auth.uid() AND public.is_teacher_safe(auth.uid())
  ) WITH CHECK (
    assigned_by = auth.uid()
  );

-- 10. Fix submissions table policies
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

-- 11. Fix quiz_results table policies
DROP POLICY IF EXISTS "Teachers can view results for their quizzes" ON public.quiz_results;

CREATE POLICY "Teachers can view results for their quizzes" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_results.quiz_id AND q.created_by = auth.uid()
    )
  );

-- 12. Fix quiz_assignees table policies
DROP POLICY IF EXISTS "Teachers manage quiz assignees for own quizzes" ON public.quiz_assignees;

CREATE POLICY "Teachers manage quiz assignees for own quizzes" ON public.quiz_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

-- 13. Fix quiz_class_assignees table policies
DROP POLICY IF EXISTS "Teachers manage class assignees for own quizzes" ON public.quiz_class_assignees;

CREATE POLICY "Teachers manage class assignees for own quizzes" ON public.quiz_class_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_class_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

-- 14. Fix quiz_questions table policies
DROP POLICY IF EXISTS "Teachers manage questions for own quizzes" ON public.quiz_questions;

CREATE POLICY "Teachers manage questions for own quizzes" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id AND q.created_by = auth.uid()
    )
  );

-- 15. Fix activity_assignees table policies
DROP POLICY IF EXISTS "Teachers manage assignees for own activities" ON public.activity_assignees;

CREATE POLICY "Teachers manage assignees for own activities" ON public.activity_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_assignees.activity_id AND a.assigned_by = auth.uid()
    )
  );

-- 16. Fix activity_class_assignees table policies
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
