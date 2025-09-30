-- Migration script to add profile_picture column to senior_citizens table
-- This script is safe to run multiple times as it checks if the column already exists

-- Add profile_picture column to senior_citizens table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE public.senior_citizens 
        ADD COLUMN profile_picture TEXT;
        
        RAISE NOTICE 'Added profile_picture column to senior_citizens table';
    ELSE
        RAISE NOTICE 'profile_picture column already exists in senior_citizens table';
    END IF;
END $$;

-- Add missing columns from the new schema if they don't exist
DO $$ 
BEGIN
    -- Check and add housing_condition column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'housing_condition'
    ) THEN
        -- Create enum type if it doesn't exist
        DO $ENUM$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housing_condition') THEN
                CREATE TYPE housing_condition AS ENUM ('owned', 'rented', 'with_family', 'institution', 'other');
            END IF;
        END $ENUM$;
        
        ALTER TABLE public.senior_citizens 
        ADD COLUMN housing_condition housing_condition DEFAULT 'owned';
        
        RAISE NOTICE 'Added housing_condition column to senior_citizens table';
    END IF;

    -- Check and add physical_health_condition column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'physical_health_condition'
    ) THEN
        -- Create enum type if it doesn't exist
        DO $ENUM$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'physical_health_condition') THEN
                CREATE TYPE physical_health_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'critical');
            END IF;
        END $ENUM$;
        
        ALTER TABLE public.senior_citizens 
        ADD COLUMN physical_health_condition physical_health_condition DEFAULT 'good';
        
        RAISE NOTICE 'Added physical_health_condition column to senior_citizens table';
    END IF;

    -- Check and add monthly_income column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'monthly_income'
    ) THEN
        ALTER TABLE public.senior_citizens 
        ADD COLUMN monthly_income DECIMAL(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Added monthly_income column to senior_citizens table';
    END IF;

    -- Check and add monthly_pension column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'monthly_pension'
    ) THEN
        ALTER TABLE public.senior_citizens 
        ADD COLUMN monthly_pension DECIMAL(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Added monthly_pension column to senior_citizens table';
    END IF;

    -- Check and add living_condition column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'living_condition'
    ) THEN
        -- Create enum type if it doesn't exist
        DO $ENUM$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'living_condition') THEN
                CREATE TYPE living_condition AS ENUM ('independent', 'with_family', 'with_caregiver', 'institution', 'other');
            END IF;
        END $ENUM$;
        
        ALTER TABLE public.senior_citizens 
        ADD COLUMN living_condition living_condition DEFAULT 'independent';
        
        RAISE NOTICE 'Added living_condition column to senior_citizens table';
    END IF;
END $$;

-- Create beneficiaries table if it doesn't exist
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

-- Add RLS policies for beneficiaries table if they don't exist
DO $$ 
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'beneficiaries' 
        AND policyname = 'Service role can manage all beneficiaries'
    ) THEN
        CREATE POLICY "Service role can manage all beneficiaries" 
        ON public.beneficiaries FOR ALL 
        USING (auth.role() = 'service_role');
    END IF;
    
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
    
    RAISE NOTICE 'RLS policies for beneficiaries table configured';
END $$;

-- Create or replace trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for beneficiaries table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_beneficiaries_updated_at'
    ) THEN
        CREATE TRIGGER update_beneficiaries_updated_at 
        BEFORE UPDATE ON public.beneficiaries 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Added update trigger for beneficiaries table';
    END IF;
END $$;

-- Update database schema to match TypeScript types
DO $$
BEGIN
    -- Update senior_citizens table with missing Insert/Update fields
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'senior_citizens' 
        AND column_name = 'housing_condition'
    ) THEN
        ALTER TABLE public.senior_citizens 
        ADD COLUMN housing_condition housing_condition DEFAULT 'owned',
        ADD COLUMN physical_health_condition physical_health_condition DEFAULT 'good',
        ADD COLUMN monthly_income DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN monthly_pension DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN living_condition living_condition DEFAULT 'independent';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;
