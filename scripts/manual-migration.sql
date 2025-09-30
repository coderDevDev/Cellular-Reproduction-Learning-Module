-- Manual Migration Script for Supabase SQL Editor
-- Copy and paste these commands into your Supabase SQL Editor one by one

-- 1. Add profile_picture column (safe to run multiple times)
ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add first_name and last_name columns (safe to run multiple times)
ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add address code columns for Philippine address selector
ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS region_code TEXT;

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS province_code TEXT;

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS city_code TEXT;

-- 2. BASCA MEMBERS TABLE MIGRATIONS
-- Add id_photo column for storing ID document photos
ALTER TABLE public.basca_members 
ADD COLUMN IF NOT EXISTS id_photo TEXT;

-- Add structured address columns for Philippine address selector
ALTER TABLE public.basca_members 
ADD COLUMN IF NOT EXISTS region_code TEXT;

ALTER TABLE public.basca_members 
ADD COLUMN IF NOT EXISTS province_code TEXT;

ALTER TABLE public.basca_members 
ADD COLUMN IF NOT EXISTS city_code TEXT;

-- 3. Create enum types (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housing_condition') THEN
        CREATE TYPE housing_condition AS ENUM ('owned', 'rented', 'with_family', 'institution', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'physical_health_condition') THEN
        CREATE TYPE physical_health_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'critical');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'living_condition') THEN
        CREATE TYPE living_condition AS ENUM ('independent', 'with_family', 'with_caregiver', 'institution', 'other');
    END IF;
END $$;

-- 4. Add new columns with default values (safe to run multiple times)
ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS housing_condition housing_condition DEFAULT 'owned';

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS physical_health_condition physical_health_condition DEFAULT 'good';

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS monthly_pension DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS living_condition living_condition DEFAULT 'independent';

-- Add created_by column to track who created the senior citizen record
ALTER TABLE public.senior_citizens 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- 5. Create beneficiaries table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    senior_citizen_id UUID REFERENCES public.senior_citizens(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    contact_phone TEXT,
    occupation TEXT,
    monthly_income DECIMAL(10,2) DEFAULT 0,
    is_dependent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS on beneficiaries table
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for beneficiaries (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'beneficiaries' 
        AND policyname = 'Service role can manage all beneficiaries'
    ) THEN
        CREATE POLICY "Service role can manage all beneficiaries" 
        ON public.beneficiaries FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'beneficiaries' 
        AND policyname = 'OSCA can manage all beneficiaries'
    ) THEN
        CREATE POLICY "OSCA can manage all beneficiaries" 
        ON public.beneficiaries FOR ALL 
        USING (EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'osca'
        ));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'beneficiaries' 
        AND policyname = 'BASCA can manage beneficiaries in their barangay'
    ) THEN
        CREATE POLICY "BASCA can manage beneficiaries in their barangay" 
        ON public.beneficiaries FOR ALL 
        USING (EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'basca' 
            AND barangay IN (
                SELECT barangay FROM public.senior_citizens 
                WHERE id = senior_citizen_id
            )
        ));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'beneficiaries' 
        AND policyname = 'Senior citizens can view own beneficiaries'
    ) THEN
        CREATE POLICY "Senior citizens can view own beneficiaries" 
        ON public.beneficiaries FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM public.senior_citizens 
            WHERE user_id = auth.uid() AND id = senior_citizen_id
        ));
    END IF;
END $$;

-- 8. Create trigger function for updating updated_at (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Add trigger for beneficiaries table (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_beneficiaries_updated_at'
    ) THEN
        CREATE TRIGGER update_beneficiaries_updated_at 
        BEFORE UPDATE ON public.beneficiaries 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 10. Verify the migration
SELECT 'Migration completed successfully!' as message;
