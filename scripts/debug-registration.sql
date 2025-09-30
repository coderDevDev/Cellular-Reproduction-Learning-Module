-- Debug Registration Issues
-- Run this in your Supabase SQL Editor to check the current state

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'properties', 'tenants');

-- 2. Check if types exist
SELECT 
  typname,
  typtype
FROM pg_type 
WHERE typname IN ('user_role', 'property_type', 'property_status', 'tenant_status');

-- 3. Check if functions exist
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column');

-- 4. Check if triggers exist
SELECT 
  tgname,
  tgrelid::regclass,
  tgfoid::regproc
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'update_users_updated_at');

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Check current users in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check current users in public.users
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Test trigger function manually (replace with actual user ID)
-- SELECT handle_new_user();

-- 9. Check for any recent errors in logs
-- (This would be visible in Supabase dashboard under Logs) 