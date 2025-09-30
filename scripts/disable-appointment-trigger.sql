-- Temporary fix: Disable the problematic appointment audit trigger
-- This will stop the error but won't log appointment changes to history table

-- Disable the trigger
DROP TRIGGER IF EXISTS appointment_audit_trigger ON appointments;

-- Optional: If you want to completely remove the history tracking function
-- DROP FUNCTION IF EXISTS handle_appointment_audit();

-- Note: This disables audit logging for appointments
-- To re-enable with the fix, run fix-appointment-trigger.sql instead
