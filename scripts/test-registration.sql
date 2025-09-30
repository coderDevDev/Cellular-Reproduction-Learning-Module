-- Test Registration Process
-- Run this in your Supabase SQL Editor to test user creation

-- 1. First, let's check if we can manually insert a test user
-- (This will help us identify if the issue is with the trigger or the table structure)

-- Test manual insertion (replace with actual values)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  phone,
  role,
  is_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Generate a new UUID
  'test@example.com',
  'Test',
  'User',
  '+1234567890',
  'tenant',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Check if the insertion worked
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.users 
WHERE email = 'test@example.com';

-- 3. Clean up test data
DELETE FROM public.users WHERE email = 'test@example.com';

-- 4. Test the trigger function with a mock user
-- (This simulates what happens when a user registers)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Simulate auth.users insertion
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    test_user_id,
    'trigger-test@example.com',
    'encrypted_password_here',
    NULL,
    NOW(),
    NOW(),
    '{"first_name": "Trigger", "last_name": "Test", "phone": "+1234567890", "role": "owner"}'::jsonb
  );
  
  -- The trigger should automatically create a record in public.users
  -- Let's check if it worked
  RAISE NOTICE 'Test user created with ID: %', test_user_id;
  
  -- Check if the trigger created the user record
  IF EXISTS (SELECT 1 FROM public.users WHERE id = test_user_id) THEN
    RAISE NOTICE 'SUCCESS: Trigger created user record';
  ELSE
    RAISE NOTICE 'FAILURE: Trigger did not create user record';
  END IF;
  
  -- Clean up
  DELETE FROM auth.users WHERE id = test_user_id;
  DELETE FROM public.users WHERE id = test_user_id;
END $$;

-- 5. Check RLS policies for the users table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Verify the trigger function exists and is working
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 7. Check if the trigger is properly attached
SELECT 
  tgname,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgenabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created'; 