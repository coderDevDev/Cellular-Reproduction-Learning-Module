-- Announcements table enhancement migration
-- Add SMS notification features and improve announcement management

-- Add new columns for enhanced SMS functionality
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS sms_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sms_delivery_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[],
ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create SMS notifications tracking table
CREATE TABLE IF NOT EXISTS public.sms_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('senior', 'family', 'emergency_contact')),
  message_content TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  provider_response TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcement reads tracking table
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_at ON public.announcements(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_announcements_priority_level ON public.announcements(priority_level);
CREATE INDEX IF NOT EXISTS idx_announcements_sms_delivery_status ON public.announcements(sms_delivery_status);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_announcement_id ON public.sms_notifications(announcement_id);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_delivery_status ON public.sms_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_recipient_phone ON public.sms_notifications(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON public.announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user_id ON public.announcement_reads(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_sms_notifications_updated_at 
  BEFORE UPDATE ON public.sms_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Pili, Camarines Sur barangays
INSERT INTO public.barangays (name, code, municipality, province) VALUES
('Anayan', '051702001', 'Pili', 'Camarines Sur'),
('Awod', '051702002', 'Pili', 'Camarines Sur'),
('Bagong Sirang', '051702003', 'Pili', 'Camarines Sur'),
('Binagasbasan', '051702004', 'Pili', 'Camarines Sur'),
('Curry', '051702005', 'Pili', 'Camarines Sur'),
('Del Rosario', '051702006', 'Pili', 'Camarines Sur'),
('Himaao', '051702007', 'Pili', 'Camarines Sur'),
('Kadlan', '051702008', 'Pili', 'Camarines Sur'),
('Pawili', '051702009', 'Pili', 'Camarines Sur'),
('Pinit', '051702010', 'Pili', 'Camarines Sur'),
('Poblacion East', '051702011', 'Pili', 'Camarines Sur'),
('Poblacion West', '051702012', 'Pili', 'Camarines Sur'),
('Sagrada', '051702013', 'Pili', 'Camarines Sur'),
('San Agustin', '051702014', 'Pili', 'Camarines Sur'),
('San Isidro', '051702015', 'Pili', 'Camarines Sur'),
('San Jose', '051702016', 'Pili', 'Camarines Sur'),
('San Juan', '051702017', 'Pili', 'Camarines Sur'),
('San Vicente', '051702018', 'Pili', 'Camarines Sur'),
('Santa Cruz Norte', '051702019', 'Pili', 'Camarines Sur'),
('Santa Cruz Sur', '051702020', 'Pili', 'Camarines Sur'),
('Santo Domingo', '051702021', 'Pili', 'Camarines Sur'),
('Tagbong', '051702022', 'Pili', 'Camarines Sur') 
ON CONFLICT (code) DO NOTHING;

-- Create barangays table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.barangays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  municipality TEXT NOT NULL,
  province TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON public.sms_notifications TO authenticated;
GRANT ALL ON public.announcement_reads TO authenticated;
GRANT ALL ON public.barangays TO authenticated;

-- RLS Policies for SMS notifications
ALTER TABLE public.sms_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OSCA can manage all SMS notifications" ON public.sms_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'osca'
    )
  );

CREATE POLICY "BASCA can view SMS notifications for their barangay" ON public.sms_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.announcements a ON sms_notifications.announcement_id = a.id
      WHERE u.id = auth.uid() AND u.role = 'basca' AND u.barangay = a.target_barangay
    )
  );

-- RLS Policies for announcement reads
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own announcement reads" ON public.announcement_reads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "OSCA can view all announcement reads" ON public.announcement_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'osca'
    )
  );

-- RLS Policies for barangays
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view barangays" ON public.barangays
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "OSCA can manage barangays" ON public.barangays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'osca'
    )
  );
