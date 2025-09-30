-- Fix for appointment history trigger bug
-- The trigger was using NEW.updated_at instead of user ID for changed_by

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS appointment_audit_trigger ON appointments;
DROP FUNCTION IF EXISTS handle_appointment_audit();

-- Create corrected trigger function
CREATE OR REPLACE FUNCTION handle_appointment_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO appointment_history (
            appointment_id, action, field_name, old_value, new_value, changed_by
        ) VALUES (
            NEW.id, 
            'status_changed', 
            'status', 
            OLD.status::TEXT, 
            NEW.status::TEXT, 
            COALESCE(auth.uid(), NEW.created_by) -- Use current user or fallback to creator
        );
    END IF;

    -- Log general updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO appointment_history (
            appointment_id, action, changed_by
        ) VALUES (
            NEW.id, 
            'updated', 
            COALESCE(auth.uid(), NEW.created_by) -- Use current user or fallback to creator
        );
    END IF;

    -- Log creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO appointment_history (
            appointment_id, action, changed_by
        ) VALUES (
            NEW.id, 
            'created', 
            NEW.created_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER appointment_audit_trigger
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION handle_appointment_audit();

-- Also, let's make sure the appointment_history table has proper constraints
-- (This is safe to run even if constraints already exist)
ALTER TABLE appointment_history 
    ADD CONSTRAINT IF NOT EXISTS fk_appointment_history_changed_by 
    FOREIGN KEY (changed_by) REFERENCES auth.users(id);

-- Grant necessary permissions
GRANT INSERT ON appointment_history TO authenticated;
GRANT USAGE ON SEQUENCE appointment_history_id_seq TO authenticated;
