-- Temporary script to disable RLS if you get permission errors during testing
-- Run this ONLY for development/testing purposes

-- Disable RLS temporarily
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history DISABLE ROW LEVEL SECURITY;

-- OR alternatively, add a temporary admin policy
DROP POLICY IF EXISTS "temp_admin_access" ON appointments;
CREATE POLICY "temp_admin_access" ON appointments
    FOR ALL USING (true);

-- Remember to re-enable RLS and remove this policy once you have proper roles set up:
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- DROP POLICY "temp_admin_access" ON appointments;
