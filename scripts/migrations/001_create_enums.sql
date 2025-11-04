-- =============================================
-- Migration 001: Create ENUM Types
-- =============================================
-- Description: Creates all custom ENUM types used across the database
-- Run Order: FIRST (before any tables)
-- Idempotent: Yes (safe to run multiple times)
-- =============================================

-- =============================================
-- Learning Management System ENUMs
-- =============================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'osca', 'basca');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Learning styles (VARK model)
DO $$ BEGIN
    CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quiz types
DO $$ BEGIN
    CREATE TYPE quiz_type AS ENUM ('pre', 'post', 'formative', 'summative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Question types
DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'matching', 'short_answer', 'essay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Progress status
DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- OSCA/Senior Citizens ENUMs
-- =============================================

-- Senior citizen status
DO $$ BEGIN
    CREATE TYPE senior_status AS ENUM ('active', 'inactive', 'deceased', 'transferred');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Housing conditions
DO $$ BEGIN
    CREATE TYPE housing_condition AS ENUM ('owned', 'rented', 'living_with_family', 'homeless', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Physical health conditions
DO $$ BEGIN
    CREATE TYPE physical_health_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Living conditions
DO $$ BEGIN
    CREATE TYPE living_condition AS ENUM ('alone', 'with_spouse', 'with_family', 'with_caregiver', 'institution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Property Management ENUMs
-- =============================================

-- Property types
DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'dormitory');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property status
DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('active', 'maintenance', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tenant status
DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('active', 'pending', 'terminated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Appointments ENUMs
-- =============================================

-- Appointment types
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM (
        'bhw',
        'basca', 
        'medical',
        'consultation',
        'home_visit',
        'social_service',
        'legal_assistance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Appointment status
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'pending',
        'approved',
        'completed',
        'cancelled',
        'rescheduled',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priority levels
DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Document/Benefit ENUMs
-- =============================================

-- Document request status
DO $$ BEGIN
    CREATE TYPE document_request_status AS ENUM (
        'pending',
        'processing',
        'approved',
        'rejected',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Benefit status
DO $$ BEGIN
    CREATE TYPE benefit_status AS ENUM (
        'active',
        'suspended',
        'terminated',
        'pending_approval'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Announcements ENUMs
-- =============================================

-- Announcement types
DO $$ BEGIN
    CREATE TYPE announcement_type AS ENUM (
        'general',
        'urgent',
        'event',
        'reminder',
        'policy',
        'health_advisory'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Verification
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 001 completed successfully';
    RAISE NOTICE 'Created ENUM types:';
    RAISE NOTICE '  - user_role';
    RAISE NOTICE '  - learning_style';
    RAISE NOTICE '  - quiz_type, question_type, progress_status';
    RAISE NOTICE '  - senior_status, housing_condition, physical_health_condition, living_condition';
    RAISE NOTICE '  - property_type, property_status, tenant_status';
    RAISE NOTICE '  - appointment_type, appointment_status, priority_level';
    RAISE NOTICE '  - document_request_status, benefit_status';
    RAISE NOTICE '  - announcement_type';
END $$;

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
-- WARNING: This will drop all ENUM types and cascade to dependent tables!
-- Only use in development or emergency situations
/*
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS learning_style CASCADE;
DROP TYPE IF EXISTS quiz_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS progress_status CASCADE;
DROP TYPE IF EXISTS senior_status CASCADE;
DROP TYPE IF EXISTS housing_condition CASCADE;
DROP TYPE IF EXISTS physical_health_condition CASCADE;
DROP TYPE IF EXISTS living_condition CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS property_status CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;
DROP TYPE IF EXISTS appointment_type CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS document_request_status CASCADE;
DROP TYPE IF EXISTS benefit_status CASCADE;
DROP TYPE IF EXISTS announcement_type CASCADE;
*/