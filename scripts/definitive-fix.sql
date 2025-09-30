-- DEFINITIVE FIX for appointment trigger error
-- This fixes the exact bug in line 238 of the original migration

-- 1. Drop the buggy trigger and function
DROP TRIGGER IF EXISTS log_appointment_changes_trigger ON appointments;
DROP FUNCTION IF EXISTS log_appointment_changes();

-- 2. Create the corrected function (fixes the bug on line 238)
CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes (FIXED: use auth.uid() instead of NEW.updated_at)
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO appointment_history (
            appointment_id, action, field_name, old_value, new_value, changed_by
        ) VALUES (
            NEW.id, 'status_changed', 'status', OLD.status::TEXT, NEW.status::TEXT, 
            COALESCE(auth.uid(), NEW.created_by) -- FIXED: use user ID, not timestamp
        );
    END IF;
    
    -- Log general updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO appointment_history (
            appointment_id, action, changed_by
        ) VALUES (
            NEW.id, 'updated', COALESCE(auth.uid(), NEW.created_by)
        );
    END IF;
    
    -- Log creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO appointment_history (
            appointment_id, action, changed_by
        ) VALUES (
            NEW.id, 'created', NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger with the fixed function
CREATE TRIGGER log_appointment_changes_trigger
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_changes();

-- 4. Ensure proper permissions
GRANT INSERT ON appointment_history TO authenticated;

-- Success message
SELECT 'Definitive fix applied! The bug in line 238 has been corrected.' as result;
