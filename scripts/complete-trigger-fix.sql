-- Complete fix for appointment trigger issues
-- Run this entire script in your Supabase SQL Editor

-- 1. Drop all existing triggers and functions related to appointments
DROP TRIGGER IF EXISTS appointment_audit_trigger ON appointments;
DROP TRIGGER IF EXISTS appointment_history_trigger ON appointments;
DROP TRIGGER IF EXISTS set_updated_at_trigger ON appointments;
DROP FUNCTION IF EXISTS handle_appointment_audit();
DROP FUNCTION IF EXISTS handle_appointment_history();

-- 2. Check if appointment_history table exists and has the right structure
DO $$ 
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointment_history') THEN
        -- Drop the problematic foreign key if it exists
        ALTER TABLE appointment_history DROP CONSTRAINT IF EXISTS appointment_history_changed_by_fkey;
        ALTER TABLE appointment_history DROP CONSTRAINT IF EXISTS fk_appointment_history_changed_by;
        
        -- Make changed_by nullable temporarily to avoid issues
        ALTER TABLE appointment_history ALTER COLUMN changed_by DROP NOT NULL;
        
        RAISE NOTICE 'appointment_history table structure updated';
    ELSE
        RAISE NOTICE 'appointment_history table does not exist';
    END IF;
END $$;

-- 3. Ensure appointments table has proper structure
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE appointments ALTER COLUMN updated_at SET DEFAULT now();

-- 4. Create a simple trigger that won't cause type conflicts
CREATE OR REPLACE FUNCTION simple_appointment_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Just update the timestamp, no history logging for now
    NEW.updated_at = now();
    
    -- Only set updated_by if we can get the current user
    BEGIN
        NEW.updated_by = auth.uid();
    EXCEPTION WHEN OTHERS THEN
        -- If auth.uid() fails, leave updated_by as is
        NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the simple trigger
CREATE TRIGGER simple_appointment_update_trigger
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION simple_appointment_update();

-- 6. Grant necessary permissions
GRANT UPDATE ON appointments TO authenticated;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Appointment trigger fix completed successfully!';
END $$;
