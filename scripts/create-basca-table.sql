-- Create basca_members table for additional BASCA-specific data
CREATE TABLE public.basca_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  barangay TEXT NOT NULL,
  barangay_code TEXT NOT NULL,
  address TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('president', 'vice_president', 'secretary', 'treasurer', 'member', 'coordinator')),
  department TEXT,
  employee_id TEXT,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_picture TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  training_certifications TEXT[] DEFAULT '{}',
  last_training_date DATE,
  next_training_date DATE,
  attendance_rate DECIMAL(5,2) DEFAULT 0,
  total_meetings_attended INTEGER DEFAULT 0,
  total_meetings_conducted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

-- Create basca_meetings table for tracking meetings
CREATE TABLE public.basca_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  barangay TEXT NOT NULL,
  barangay_code TEXT NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular', 'emergency', 'training', 'planning', 'other')),
  agenda TEXT[] DEFAULT '{}',
  minutes TEXT,
  attendees_count INTEGER DEFAULT 0,
  is_conducted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basca_meeting_attendees table for tracking attendance
CREATE TABLE public.basca_meeting_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.basca_meetings(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.basca_members(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_present BOOLEAN DEFAULT FALSE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  departure_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, member_id)
);

-- Create basca_training_sessions table for tracking training
CREATE TABLE public.basca_training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  training_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  trainer_name TEXT,
  trainer_organization TEXT,
  training_type TEXT NOT NULL CHECK (training_type IN ('basic', 'advanced', 'specialized', 'refresher', 'certification')),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basca_training_participants table
CREATE TABLE public.basca_training_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_session_id UUID REFERENCES public.basca_training_sessions(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.basca_members(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_registered BOOLEAN DEFAULT FALSE,
  is_attended BOOLEAN DEFAULT FALSE,
  completion_certificate TEXT,
  score DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(training_session_id, member_id)
);

-- Create basca_activities table for tracking community activities
CREATE TABLE public.basca_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  barangay TEXT NOT NULL,
  barangay_code TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('health_campaign', 'vaccination', 'screening', 'education', 'outreach', 'other')),
  target_audience TEXT,
  expected_participants INTEGER,
  actual_participants INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  outcomes TEXT,
  challenges TEXT,
  recommendations TEXT,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basca_activity_participants table
CREATE TABLE public.basca_activity_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.basca_activities(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.basca_members(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('organizer', 'participant', 'supervisor', 'volunteer')),
  hours_contributed DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX idx_basca_members_user_id ON public.basca_members(user_id);
CREATE INDEX idx_basca_members_barangay ON public.basca_members(barangay);
CREATE INDEX idx_basca_members_position ON public.basca_members(position);
CREATE INDEX idx_basca_members_is_active ON public.basca_members(is_active);
CREATE INDEX idx_basca_members_join_date ON public.basca_members(join_date);

CREATE INDEX idx_basca_meetings_barangay ON public.basca_meetings(barangay);
CREATE INDEX idx_basca_meetings_date ON public.basca_meetings(meeting_date);
CREATE INDEX idx_basca_meetings_type ON public.basca_meetings(meeting_type);

CREATE INDEX idx_basca_meeting_attendees_meeting_id ON public.basca_meeting_attendees(meeting_id);
CREATE INDEX idx_basca_meeting_attendees_member_id ON public.basca_meeting_attendees(member_id);

CREATE INDEX idx_basca_training_sessions_date ON public.basca_training_sessions(training_date);
CREATE INDEX idx_basca_training_sessions_type ON public.basca_training_sessions(training_type);

CREATE INDEX idx_basca_training_participants_training_id ON public.basca_training_participants(training_session_id);
CREATE INDEX idx_basca_training_participants_member_id ON public.basca_training_participants(member_id);

CREATE INDEX idx_basca_activities_barangay ON public.basca_activities(barangay);
CREATE INDEX idx_basca_activities_date ON public.basca_activities(activity_date);
CREATE INDEX idx_basca_activities_type ON public.basca_activities(activity_type);

CREATE INDEX idx_basca_activity_participants_activity_id ON public.basca_activity_participants(activity_id);
CREATE INDEX idx_basca_activity_participants_member_id ON public.basca_activity_participants(member_id);

-- Enable RLS on new tables
ALTER TABLE public.basca_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basca_activity_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for basca_members
CREATE POLICY "Service role can manage all basca members" ON public.basca_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "OSCA can manage all basca members" ON public.basca_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'osca'
    )
  );

CREATE POLICY "BASCA members can view their own data" ON public.basca_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "BASCA members can update their own data" ON public.basca_members
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Create RLS policies for basca_meetings
CREATE POLICY "Service role can manage all basca meetings" ON public.basca_meetings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "OSCA can manage all basca meetings" ON public.basca_meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'osca'
    )
  );

CREATE POLICY "BASCA members can view meetings in their barangay" ON public.basca_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.basca_members
      WHERE basca_members.user_id = auth.uid()
      AND basca_members.barangay = basca_meetings.barangay
    )
  );

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Service role can manage all basca data" ON public.basca_meeting_attendees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all basca data" ON public.basca_training_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all basca data" ON public.basca_training_participants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all basca data" ON public.basca_activities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all basca data" ON public.basca_activity_participants
  FOR ALL USING (auth.role() = 'service_role');

-- Create triggers for updated_at
CREATE TRIGGER update_basca_members_updated_at BEFORE UPDATE ON public.basca_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basca_meetings_updated_at BEFORE UPDATE ON public.basca_meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basca_training_sessions_updated_at BEFORE UPDATE ON public.basca_training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basca_training_participants_updated_at BEFORE UPDATE ON public.basca_training_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basca_activities_updated_at BEFORE UPDATE ON public.basca_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
