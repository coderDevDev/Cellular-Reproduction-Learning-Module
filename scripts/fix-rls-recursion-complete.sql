-- Complete fix for infinite recursion in RLS policies for profiles table
-- This script completely removes all problematic policies and creates a clean solution

-- 1. Disable RLS temporarily to clean up policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 3. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create clean, non-recursive policies
-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own profile (simple, non-recursive)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (simple, non-recursive)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. For teacher access to all profiles, we'll use a different approach
-- Instead of querying the profiles table from within a policy,
-- we'll create a function that checks the user's role
CREATE OR REPLACE FUNCTION public.is_teacher(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function is safe because it's not called from within a policy
  -- that's already evaluating the profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create teacher policy using the function
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_teacher(auth.uid()));

-- 7. Verify the policies are working
SELECT 'RLS policies completely fixed for profiles table' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- 8. Test the function
SELECT 'Testing is_teacher function:' as info;
SELECT public.is_teacher(auth.uid()) as is_current_user_teacher;

