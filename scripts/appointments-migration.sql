-- =============================================
-- OSCA Appointments System Migration Script
-- =============================================
-- This script creates all necessary tables and structures for the appointments system
-- Execute this in your Supabase SQL editor or psql terminal

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS appointments CASCADE;
-- DROP TABLE IF EXISTS appointment_requirements CASCADE;
-- DROP TABLE IF EXISTS appointment_notifications CASCADE;

-- =============================================
-- 1. Create ENUM types for appointments
-- =============================================

-- Appointment type enum
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM (
        'bhw',
        'basca', 
        'medical',
        'consultation',
        'home_visit'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Appointment status enum
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'pending',
        'approved',
        'completed',
        'cancelled',
        'rescheduled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priority level enum
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
-- 2. Create appointments table
-- =============================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Senior citizen reference
    senior_citizen_id UUID NOT NULL REFERENCES senior_citizens(id) ON DELETE CASCADE,
    
    -- Appointment details
    appointment_type appointment_type NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose TEXT NOT NULL CHECK (char_length(purpose) >= 10 AND char_length(purpose) <= 500),
    
    -- Status and priority
    status appointment_status NOT NULL DEFAULT 'pending',
    priority_level priority_level DEFAULT 'medium',
    
    -- Additional information
    location TEXT,
    estimated_duration INTEGER DEFAULT 60 CHECK (estimated_duration >= 15 AND estimated_duration <= 480),
    notes TEXT CHECK (char_length(notes) <= 1000),
    
    -- Requirements and follow-up
    requirements TEXT[], -- Array of requirement strings
    follow_up_required BOOLEAN DEFAULT FALSE,
    
    -- Staff and workflow
    assigned_staff UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. Create appointment requirements lookup table
-- =============================================

CREATE TABLE IF NOT EXISTS appointment_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common requirements
INSERT INTO appointment_requirements (name, description) VALUES
    ('Medical records', 'Previous medical records and history'),
    ('OSCA ID', 'Official Senior Citizen ID card'),
    ('Birth certificate', 'Official birth certificate document'),
    ('Prescription medications', 'Current prescription medications'),
    ('Previous test results', 'Laboratory or medical test results'),
    ('Insurance documents', 'Health insurance or PhilHealth documents'),
    ('Contact person present', 'Family member or guardian present'),
    ('Wheelchair accessibility', 'Wheelchair accessible venue required'),
    ('Interpreter needed', 'Language interpreter assistance'),
    ('Transportation assistance', 'Help with transportation to venue')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 4. Create appointment notifications table
-- =============================================

CREATE TABLE IF NOT EXISTS appointment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type TEXT NOT NULL, -- 'sms', 'email', 'in_app'
    recipient_type TEXT NOT NULL,    -- 'senior', 'family', 'staff'
    recipient_contact TEXT NOT NULL, -- phone number or email
    
    -- Message content
    message TEXT NOT NULL,
    subject TEXT,
    
    -- Delivery status
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. Create appointment history table (for audit trail)
-- =============================================

CREATE TABLE IF NOT EXISTS appointment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Change details
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
    field_name TEXT,      -- which field was changed
    old_value TEXT,       -- previous value
    new_value TEXT,       -- new value
    
    -- Who made the change
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    change_reason TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. Create indexes for performance
-- =============================================

-- Appointments table indexes
CREATE INDEX IF NOT EXISTS idx_appointments_senior_citizen_id ON appointments(senior_citizen_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_staff ON appointments(assigned_staff);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_senior_date ON appointments(senior_citizen_id, appointment_date);

-- Notification table indexes
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment_id ON appointment_notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_status ON appointment_notifications(status);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_type ON appointment_notifications(notification_type);

-- History table indexes
CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_action ON appointment_history(action);
CREATE INDEX IF NOT EXISTS idx_appointment_history_changed_by ON appointment_history(changed_by);

-- =============================================
-- 7. Create triggers for automatic timestamps and history
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for appointments table
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for appointment_notifications table
DROP TRIGGER IF EXISTS update_appointment_notifications_updated_at ON appointment_notifications;
CREATE TRIGGER update_appointment_notifications_updated_at
    BEFORE UPDATE ON appointment_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log appointment changes
CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO appointment_history (
            appointment_id, action, field_name, old_value, new_value, changed_by
        ) VALUES (
            NEW.id, 'status_changed', 'status', OLD.status::TEXT, NEW.status::TEXT, NEW.updated_at
        );
    END IF;
    
    -- Log general updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO appointment_history (
            appointment_id, action, changed_by
        ) VALUES (
            NEW.id, 'updated', auth.uid()
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
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger for appointment history logging
DROP TRIGGER IF EXISTS log_appointment_changes_trigger ON appointments;
CREATE TRIGGER log_appointment_changes_trigger
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_changes();

-- =============================================
-- 8. Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- Appointments table policies
DROP POLICY IF EXISTS "appointments_osca_full_access" ON appointments;
CREATE POLICY "appointments_osca_full_access" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'osca'
        )
    );

DROP POLICY IF EXISTS "appointments_basca_barangay_access" ON appointments;
CREATE POLICY "appointments_basca_barangay_access" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN senior_citizens sc ON sc.id = appointments.senior_citizen_id
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'basca'
            AND sc.barangay = (
                SELECT barangay FROM senior_citizens s2
                JOIN users u ON u.id = s2.user_id
                WHERE u.id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "appointments_senior_own_access" ON appointments;
CREATE POLICY "appointments_senior_own_access" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM senior_citizens 
            WHERE senior_citizens.user_id = auth.uid()
            AND senior_citizens.id = appointments.senior_citizen_id
        )
    );

-- Appointment requirements policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "appointment_requirements_read_access" ON appointment_requirements;
CREATE POLICY "appointment_requirements_read_access" ON appointment_requirements
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "appointment_requirements_osca_manage" ON appointment_requirements;
CREATE POLICY "appointment_requirements_osca_manage" ON appointment_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'osca'
        )
    );

-- Appointment notifications policies
DROP POLICY IF EXISTS "appointment_notifications_osca_access" ON appointment_notifications;
CREATE POLICY "appointment_notifications_osca_access" ON appointment_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'osca'
        )
    );

-- Appointment history policies (read-only)
DROP POLICY IF EXISTS "appointment_history_osca_read" ON appointment_history;
CREATE POLICY "appointment_history_osca_read" ON appointment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'osca'
        )
    );

-- =============================================
-- 9. Useful functions for appointment management
-- =============================================

-- Function to get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_time_slots(
    appointment_date DATE,
    appointment_type_param appointment_type DEFAULT 'medical'
)
RETURNS TEXT[] AS $$
DECLARE
    all_slots TEXT[];
    booked_slots TEXT[];
    available_slots TEXT[];
BEGIN
    -- Define time slots based on appointment type
    IF appointment_type_param = 'medical' THEN
        all_slots := ARRAY['08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                          '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
                          '15:00', '15:30', '16:00', '16:30'];
    ELSE
        all_slots := ARRAY['08:00', '09:00', '10:00', '11:00', '13:00', 
                          '14:00', '15:00', '16:00', '17:00'];
    END IF;
    
    -- Get booked slots
    SELECT ARRAY_AGG(appointment_time::TEXT)
    INTO booked_slots
    FROM appointments 
    WHERE appointment_date = appointment_date
    AND status IN ('pending', 'approved');
    
    -- Calculate available slots
    SELECT ARRAY_AGG(slot)
    INTO available_slots
    FROM UNNEST(all_slots) AS slot
    WHERE slot != ALL(COALESCE(booked_slots, ARRAY[]::TEXT[]));
    
    RETURN COALESCE(available_slots, all_slots);
END;
$$ LANGUAGE plpgsql;

-- Function to check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    senior_id UUID,
    appointment_date DATE,
    appointment_time TIME,
    exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE senior_citizen_id = senior_id
    AND appointment_date = appointment_date
    AND appointment_time = appointment_time
    AND status IN ('pending', 'approved')
    AND (exclude_appointment_id IS NULL OR id != exclude_appointment_id);
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get appointment statistics
CREATE OR REPLACE FUNCTION get_appointment_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
    today DATE := CURRENT_DATE;
    week_end DATE := today + INTERVAL '7 days';
BEGIN
    SELECT json_build_object(
        'total', (SELECT COUNT(*) FROM appointments),
        'pending', (SELECT COUNT(*) FROM appointments WHERE status = 'pending'),
        'approved', (SELECT COUNT(*) FROM appointments WHERE status = 'approved'),
        'completed', (SELECT COUNT(*) FROM appointments WHERE status = 'completed'),
        'cancelled', (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled'),
        'today', (SELECT COUNT(*) FROM appointments WHERE appointment_date = today),
        'thisWeek', (SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN today AND week_end),
        'overdue', (SELECT COUNT(*) FROM appointments WHERE appointment_date < today AND status IN ('pending', 'approved'))
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. Sample data (optional - for testing)
-- =============================================

-- Uncomment the following to insert sample data for testing

/*
-- Insert sample appointments (make sure senior_citizens exist first)
INSERT INTO appointments (
    senior_citizen_id,
    appointment_type,
    appointment_date,
    appointment_time,
    purpose,
    status,
    priority_level,
    created_by
) VALUES 
(
    (SELECT id FROM senior_citizens LIMIT 1),
    'medical',
    CURRENT_DATE + INTERVAL '3 days',
    '09:00',
    'Regular health check-up and blood pressure monitoring for hypertension management',
    'pending',
    'medium',
    (SELECT id FROM auth.users WHERE email LIKE '%osca%' LIMIT 1)
),
(
    (SELECT id FROM senior_citizens LIMIT 1 OFFSET 1),
    'bhw',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00',
    'Home visit for medication consultation and daily living assistance',
    'approved',
    'high',
    (SELECT id FROM auth.users WHERE email LIKE '%osca%' LIMIT 1)
);
*/

-- =============================================
-- 11. Verification queries
-- =============================================

-- Verify tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('appointments', 'appointment_requirements', 'appointment_notifications', 'appointment_history')
ORDER BY tablename;

-- Verify indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE 'appointment%'
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename LIKE 'appointment%'
ORDER BY tablename, policyname;

-- =============================================
-- Migration script completed successfully!
-- =============================================

-- Notes:
-- 1. Make sure the senior_citizens table exists before running this script
-- 2. Make sure the user_roles table exists for RLS policies
-- 3. Adjust the policies based on your specific role requirements
-- 4. Test the functions with sample data before using in production
-- 5. Consider adding additional indexes based on your query patterns

COMMENT ON TABLE appointments IS 'Main appointments table for OSCA appointment management system';
COMMENT ON TABLE appointment_requirements IS 'Lookup table for common appointment requirements';
COMMENT ON TABLE appointment_notifications IS 'Notification history for appointments';
COMMENT ON TABLE appointment_history IS 'Audit trail for appointment changes';
