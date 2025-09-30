-- Minimal appointments migration for quick testing
-- Run this if you want to get the page working quickly

-- Create basic appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_citizen_id UUID NOT NULL,
    appointment_type TEXT NOT NULL DEFAULT 'medical',
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority_level TEXT DEFAULT 'medium',
    location TEXT,
    estimated_duration INTEGER DEFAULT 60,
    notes TEXT,
    requirements TEXT[],
    follow_up_required BOOLEAN DEFAULT FALSE,
    assigned_staff UUID,
    created_by UUID,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment requirements table
CREATE TABLE IF NOT EXISTS appointment_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert basic requirements
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

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_appointments_senior_citizen_id ON appointments(senior_citizen_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Disable RLS for testing (re-enable later with proper policies)
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requirements DISABLE ROW LEVEL SECURITY;

-- Verify tables
SELECT 'appointments' as table_name, COUNT(*) as row_count FROM appointments
UNION ALL
SELECT 'appointment_requirements', COUNT(*) FROM appointment_requirements;
