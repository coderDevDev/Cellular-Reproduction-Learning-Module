-- Complete Database Fix for Registration Issues
-- Run this in your Supabase SQL editor

-- 1. First, let's check what we have
SELECT 'Current profiles table structure:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';

-- 2. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Ensure profiles table has all required fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 4. Create a simplified, robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with error handling
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
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'middle_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    NEW.raw_user_meta_data->>'grade_level',
    NEW.raw_user_meta_data->>'profile_photo',
    NULL, -- learning_style will be set during VARK assessment
    FALSE, -- onboarding_completed starts as false
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Test the trigger function
SELECT 'Trigger function created successfully' as status;

-- 7. Check if there are any existing users without profiles
SELECT 'Users without profiles:' as info;
SELECT id, email FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 8. Create profiles for any existing users (if needed)
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
)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'middle_name',
  u.raw_user_meta_data->>'last_name',
  u.raw_user_meta_data->>'full_name',
  COALESCE(u.raw_user_meta_data->>'role', 'student')::user_role,
  u.raw_user_meta_data->>'grade_level',
  u.raw_user_meta_data->>'profile_photo',
  NULL,
  FALSE,
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 9. Final verification
SELECT 'Final profiles count:' as info, COUNT(*) as total_profiles FROM public.profiles;
SELECT 'Final users count:' as info, COUNT(*) as total_users FROM auth.users;
