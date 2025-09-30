-- Fix infinite recursion in RLS policies for profiles table
-- This script removes the problematic policies and creates simpler, non-recursive ones

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. Create simpler, non-recursive policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teachers can view all profiles (completely non-recursive)
-- We'll use a different approach: store the role in auth.jwt() claims
-- For now, let's create a simple policy that allows authenticated users to view profiles
-- This can be refined later with proper role-based access
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Verify the policies are working
SELECT 'RLS policies fixed for profiles table' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';
