-- =============================================
-- Migration 002: Create Database Functions
-- =============================================
-- Description: Creates reusable database functions and utilities
-- Dependencies: 001_create_enums.sql
-- Idempotent: Yes (uses CREATE OR REPLACE)
-- =============================================

-- =============================================
-- Function: Update updated_at timestamp
-- =============================================
-- Usage: Automatically updates the updated_at column on row updates

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Trigger function to automatically update updated_at timestamp';

-- =============================================
-- Function: Handle updated_at (alias)
-- =============================================
-- Alternative name for compatibility

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function: Set profile full name
-- =============================================
-- Concatenates first_name, middle_name, last_name into full_name

CREATE OR REPLACE FUNCTION public.set_profile_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := regexp_replace(
    trim(both ' ' from 
      coalesce(NEW.first_name,'') || ' ' || 
      coalesce(NEW.middle_name,'') || ' ' || 
      coalesce(NEW.last_name,'')
    ),
    '\s+', ' ', 'g'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_profile_full_name() IS 
'Automatically generates full_name from first_name, middle_name, last_name';

-- =============================================
-- Function: Handle new user registration
-- =============================================
-- Creates profile record when new auth user is created

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function to create profile when new auth user is created';

-- =============================================
-- Function: Calculate age from date of birth
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_age(date_of_birth DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calculate_age(DATE) IS 
'Calculates age in years from date of birth';

-- =============================================
-- Function: Generate unique OSCA ID
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_osca_id(barangay_code TEXT)
RETURNS TEXT AS $$
DECLARE
  year_code TEXT;
  sequence_num INTEGER;
  osca_id TEXT;
BEGIN
  year_code := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this barangay and year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(osca_id FROM LENGTH(osca_id) - 3) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.senior_citizens
  WHERE osca_id LIKE barangay_code || '-' || year_code || '%';
  
  osca_id := barangay_code || '-' || year_code || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN osca_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_osca_id(TEXT) IS 
'Generates unique OSCA ID in format: BRGY-YY-0001';

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed successfully';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '  - update_updated_at_column()';
    RAISE NOTICE '  - handle_updated_at()';
    RAISE NOTICE '  - set_profile_full_name()';
    RAISE NOTICE '  - handle_new_user()';
    RAISE NOTICE '  - calculate_age(date)';
    RAISE NOTICE '  - generate_osca_id(barangay_code)';
END $$;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
/*
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_profile_full_name() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_age(DATE) CASCADE;
DROP FUNCTION IF EXISTS public.generate_osca_id(TEXT) CASCADE;
*/