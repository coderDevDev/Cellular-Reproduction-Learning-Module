-- Fix for registration trigger - Add missing grade_level field
-- Run this in your Supabase SQL editor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with grade_level support
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
  grade_level_text TEXT;
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
  grade_level_text := COALESCE(NEW.raw_user_meta_data->>'grade_level', NULL);

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
    grade_level,
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
    grade_level_text,
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the trigger (optional)
-- SELECT * FROM public.profiles LIMIT 5;
