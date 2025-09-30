-- Learning Management Database Schema (Supabase)

DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.activity_class_assignees CASCADE;
DROP TABLE IF EXISTS public.quiz_class_assignees CASCADE;
DROP TABLE IF EXISTS public.activity_assignees CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.quiz_assignees CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.learning_style_assessments CASCADE;
DROP TABLE IF EXISTS public.class_students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;



DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS senior_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS document_request_status CASCADE;
DROP TYPE IF EXISTS benefit_status CASCADE;
DROP TYPE IF EXISTS announcement_type CASCADE;
DROP TYPE IF EXISTS housing_condition CASCADE;
DROP TYPE IF EXISTS physical_health_condition CASCADE;
DROP TYPE IF EXISTS living_condition CASCADE;
DROP TYPE IF EXISTS learning_style CASCADE;
DROP TYPE IF EXISTS quiz_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS progress_status CASCADE;

-- Create custom types for Learning Module
CREATE TYPE user_role AS ENUM ('student', 'teacher');
CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic');
CREATE TYPE quiz_type AS ENUM ('pre', 'post');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'matching', 'short_answer');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role user_role NOT NULL,
  grade_level TEXT,
  profile_photo TEXT,
  learning_style learning_style,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintain full_name from parts
CREATE OR REPLACE FUNCTION public.set_profile_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := regexp_replace(
    trim(both ' ' from coalesce(NEW.first_name,'') || ' ' || coalesce(NEW.middle_name,'') || ' ' || coalesce(NEW.last_name,'')),
    '\\s+', ' ', 'g'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_full_name_before_ins
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_full_name();

CREATE TRIGGER set_profiles_full_name_before_upd
  BEFORE UPDATE OF first_name, middle_name, last_name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_full_name();

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_url TEXT NOT NULL,
  subject TEXT,
  grade_level TEXT,
  vark_tag learning_style,
  resource_type TEXT, -- e.g., video, document, slideshow
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE public.class_students (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type quiz_type NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- for MCQ/matching
  correct_answer JSONB, -- flexible for various types
  points INTEGER DEFAULT 1,
  position INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz assignees (student-level assignment)
CREATE TABLE public.quiz_assignees (
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (quiz_id, student_id)
);

-- Quiz class assignees (class-level assignment)
CREATE TABLE public.quiz_class_assignees (
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (quiz_id, class_id)
);

-- Quiz results (per attempt)
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  total_points INTEGER NOT NULL,
  responses JSONB, -- captured answers
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (quiz_id, student_id, attempt_number)
);

-- Activities (assignments/projects)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  rubric_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  grading_mode TEXT, -- e.g., points, rubric
  is_published BOOLEAN DEFAULT FALSE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity assignees (student-level assignment)
CREATE TABLE public.activity_assignees (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (activity_id, student_id)
);

-- Activity class assignees (class-level assignment)
CREATE TABLE public.activity_class_assignees (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (activity_id, class_id)
);

-- Submissions for activities
CREATE TABLE public.submissions (
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

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role user_role, -- NULL = everyone
  target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_learning_style ON public.profiles(learning_style);

CREATE INDEX idx_classes_created_by ON public.classes(created_by);
CREATE INDEX idx_class_students_student_id ON public.class_students(student_id);

CREATE INDEX idx_lessons_created_by ON public.lessons(created_by);
CREATE INDEX idx_lessons_published ON public.lessons(is_published);
CREATE INDEX idx_lessons_vark_tag ON public.lessons(vark_tag);

CREATE INDEX idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX idx_quiz_assignees_student_id ON public.quiz_assignees(student_id);
CREATE INDEX idx_quiz_class_assignees_class_id ON public.quiz_class_assignees(class_id);
CREATE INDEX idx_quiz_results_quiz_student ON public.quiz_results(quiz_id, student_id);

CREATE INDEX idx_activities_assigned_by ON public.activities(assigned_by);
CREATE INDEX idx_activity_assignees_student_id ON public.activity_assignees(student_id);
CREATE INDEX idx_activity_class_assignees_class_id ON public.activity_class_assignees(class_id);
CREATE INDEX idx_submissions_activity_student ON public.submissions(activity_id, student_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_class_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_class_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies: classes
CREATE POLICY "Service role can manage all classes" ON public.classes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own classes" ON public.classes
  FOR ALL USING (
    created_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
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

-- Policies: class_students
CREATE POLICY "Service role can manage all class_students" ON public.class_students
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage enrollments for own classes" ON public.class_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_students.class_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view own enrollments" ON public.class_students
  FOR SELECT USING (student_id = auth.uid());

-- Policies: profiles
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- Policies: lessons
CREATE POLICY "Service role can manage all lessons" ON public.lessons
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own lessons" ON public.lessons
  FOR ALL USING (
    created_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  ) WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Teachers can view all lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );

CREATE POLICY "Students can view published lessons" ON public.lessons
  FOR SELECT USING (is_published = TRUE);

-- Policies: quizzes
CREATE POLICY "Service role can manage all quizzes" ON public.quizzes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own quizzes" ON public.quizzes
  FOR ALL USING (
    created_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  ) WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "Students can view assigned quizzes" ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_assignees qa
      WHERE qa.quiz_id = quizzes.id AND qa.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.quiz_class_assignees qca
      JOIN public.class_students cs ON cs.class_id = qca.class_id
      WHERE qca.quiz_id = quizzes.id AND cs.student_id = auth.uid()
    )
  );

-- Policies: quiz_class_assignees
CREATE POLICY "Service role can manage all quiz_class_assignees" ON public.quiz_class_assignees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage class assignees for own quizzes" ON public.quiz_class_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_class_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Policies: quiz_questions (teachers on their own quizzes)
CREATE POLICY "Service role can manage all quiz questions" ON public.quiz_questions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage questions for own quizzes" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_questions.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Policies: quiz_assignees
CREATE POLICY "Service role can manage all quiz_assignees" ON public.quiz_assignees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage quiz assignees for own quizzes" ON public.quiz_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_assignees.quiz_id AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view own quiz assignments" ON public.quiz_assignees
  FOR SELECT USING (student_id = auth.uid());

-- Policies: quiz_results
CREATE POLICY "Service role can manage all quiz results" ON public.quiz_results
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Students can insert own quiz results for assigned quizzes" ON public.quiz_results
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.quiz_assignees qa
      WHERE qa.quiz_id = quiz_results.quiz_id AND qa.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own quiz results" ON public.quiz_results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view results for their quizzes" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_results.quiz_id AND q.created_by = auth.uid()
    )
  );

-- Policies: activities
CREATE POLICY "Service role can manage all activities" ON public.activities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own activities" ON public.activities
  FOR ALL USING (
    assigned_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  ) WITH CHECK (
    assigned_by = auth.uid()
  );

CREATE POLICY "Students can view assigned activities" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.activity_assignees aa
      WHERE aa.activity_id = activities.id AND aa.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.activity_class_assignees aca
      JOIN public.class_students cs ON cs.class_id = aca.class_id
      WHERE aca.activity_id = activities.id AND cs.student_id = auth.uid()
    )
  );

-- Policies: activity_assignees
CREATE POLICY "Service role can manage all activity_assignees" ON public.activity_assignees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage assignees for own activities" ON public.activity_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_assignees.activity_id AND a.assigned_by = auth.uid()
    )
  );

CREATE POLICY "Students can view own activity assignments" ON public.activity_assignees
  FOR SELECT USING (student_id = auth.uid());

-- Policies: activity_class_assignees
CREATE POLICY "Service role can manage all activity_class_assignees" ON public.activity_class_assignees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers manage class assignees for own activities" ON public.activity_class_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_class_assignees.activity_id AND a.assigned_by = auth.uid()
    )
  );

-- Policies: submissions
CREATE POLICY "Service role can manage all submissions" ON public.submissions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Students can insert submissions for assigned activities" ON public.submissions
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.activity_assignees aa
      WHERE aa.activity_id = submissions.activity_id AND aa.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own submissions" ON public.submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update own submission before graded" ON public.submissions
  FOR UPDATE USING (
    student_id = auth.uid() AND graded_at IS NULL
  );

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

-- Policies: announcements
CREATE POLICY "Service role can manage all announcements" ON public.announcements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Teachers can manage own announcements" ON public.announcements
  FOR ALL USING (
    created_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  ) WITH CHECK (
    created_by = auth.uid()
  );

CREATE POLICY "All authenticated users can view published announcements" ON public.announcements
  FOR SELECT USING (
    is_published = TRUE AND (
      target_role IS NULL OR target_role = (
        SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
      )
    )
  );

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_results_updated_at BEFORE UPDATE ON public.quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-create profile from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_text TEXT;
  ls_text TEXT;
  resolved_role user_role;
  resolved_ls learning_style;
  full_name_text TEXT;
  first_name_text TEXT;
  middle_name_text TEXT;
  last_name_text TEXT;
  name_tokens TEXT[];
  token_count INT;
BEGIN
  role_text := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  IF role_text NOT IN ('student', 'teacher') THEN
    role_text := 'student';
  END IF;
  resolved_role := role_text::user_role;

  ls_text := lower(COALESCE(NEW.raw_user_meta_data->>'learning_style', NULL));
  IF ls_text IS NULL THEN
    resolved_ls := NULL;
  ELSE
    -- normalize alias 'reading/writing' to 'reading_writing'
    IF ls_text IN ('reading/writing', 'reading_writing') THEN
      ls_text := 'reading_writing';
    END IF;
    IF ls_text NOT IN ('visual','auditory','reading_writing','kinesthetic') THEN
      resolved_ls := NULL;
    ELSE
      resolved_ls := ls_text::learning_style;
    END IF;
  END IF;

  full_name_text := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);
  first_name_text := COALESCE(NEW.raw_user_meta_data->>'first_name', NULL);
  middle_name_text := COALESCE(NEW.raw_user_meta_data->>'middle_name', NULL);
  last_name_text := COALESCE(NEW.raw_user_meta_data->>'last_name', NULL);

  IF full_name_text IS NULL AND first_name_text IS NULL AND last_name_text IS NULL THEN
    full_name_text := NULL;
  ELSIF full_name_text IS NULL THEN
    full_name_text := trim(coalesce(first_name_text,'') || ' ' || coalesce(middle_name_text,'') || ' ' || coalesce(last_name_text,''));
  ELSE
    -- We have full_name; if parts are missing, derive them from full_name
    IF (first_name_text IS NULL AND last_name_text IS NULL) OR (first_name_text IS NULL AND middle_name_text IS NULL) THEN
      name_tokens := regexp_split_to_array(trim(full_name_text), '\s+');
      token_count := coalesce(array_length(name_tokens, 1), 0);
      IF token_count = 1 THEN
        first_name_text := name_tokens[1];
        last_name_text := NULL;
        middle_name_text := NULL;
      ELSIF token_count = 2 THEN
        first_name_text := name_tokens[1];
        last_name_text := name_tokens[2];
        middle_name_text := NULL;
      ELSE
        first_name_text := name_tokens[1];
        last_name_text := name_tokens[token_count];
        middle_name_text := array_to_string(name_tokens[2:token_count-1], ' ');
      END IF;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, 
    email, 
    first_name,
    middle_name,
    last_name,
    full_name,
    role,
    profile_photo,
    learning_style,
    onboarding_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    first_name_text,
    middle_name_text,
    last_name_text,
    full_name_text,
    resolved_role,
    NEW.raw_user_meta_data->>'profile_photo',
    resolved_ls,
    FALSE,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 