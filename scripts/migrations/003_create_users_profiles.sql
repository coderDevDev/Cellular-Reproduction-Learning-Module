-- =============================================
-- Migration 003: Create Users & Profiles Tables
-- =============================================
-- Description: Creates core user and profile tables
-- Dependencies: 001_create_enums.sql, 002_create_functions.sql
-- Idempotent: Yes
-- =============================================

-- =============================================
-- Table: users (extends auth.users)
-- =============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  barangay TEXT,
  barangay_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- OSCA/Owner specific fields
  company_name TEXT,
  business_license TEXT,
  
  -- Emergency contact (for tenants/seniors)
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT
);

COMMENT ON TABLE public.users IS 'Core user table extending Supabase auth.users';

-- =============================================
-- Table: profiles (for LMS students/teachers)
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  grade_level TEXT,
  profile_photo TEXT,
  learning_style learning_style,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles for Learning Management System';

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_barangay ON public.users(barangay);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_learning_style ON public.profiles(learning_style);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =============================================
-- Triggers
-- =============================================

-- Auto-update updated_at for users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate full_name for profiles
DROP TRIGGER IF EXISTS set_profiles_full_name_before_ins ON public.profiles;
CREATE TRIGGER set_profiles_full_name_before_ins
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_full_name();

DROP TRIGGER IF EXISTS set_profiles_full_name_before_upd ON public.profiles;
CREATE TRIGGER set_profiles_full_name_before_upd
  BEFORE UPDATE OF first_name, middle_name, last_name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_full_name();

-- Auto-create profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 003 completed successfully';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - public.users';
    RAISE NOTICE '  - public.profiles';
    RAISE NOTICE 'Created indexes for performance';
    RAISE NOTICE 'Created triggers for automation';
END $$;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_full_name_before_upd ON public.profiles;
DROP TRIGGER IF EXISTS set_profiles_full_name_before_ins ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_learning_style;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_users_barangay;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
*/