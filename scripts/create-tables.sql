-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'tenant');
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'dormitory');
CREATE TYPE property_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE tenant_status AS ENUM ('active', 'pending', 'terminated');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  -- Owner specific fields
  company_name TEXT,
  business_license TEXT,
  -- Tenant specific fields
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type property_type NOT NULL,
  address TEXT NOT NULL,
  total_units INTEGER NOT NULL CHECK (total_units > 0),
  occupied_units INTEGER DEFAULT 0 CHECK (occupied_units >= 0),
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent >= 0),
  status property_status DEFAULT 'active',
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT occupied_units_check CHECK (occupied_units <= total_units)
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  lease_start DATE NOT NULL,
  lease_end DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent >= 0),
  deposit DECIMAL(10,2) NOT NULL CHECK (deposit >= 0),
  status tenant_status DEFAULT 'pending',
  documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, unit_number),
  CONSTRAINT lease_dates_check CHECK (lease_end > lease_start)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for properties table
CREATE POLICY "Property owners can view own properties" ON public.properties
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Property owners can insert own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Property owners can update own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Property owners can delete own properties" ON public.properties
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for tenants table
CREATE POLICY "Tenants can view own tenant record" ON public.tenants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view tenants of their properties" ON public.tenants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

CREATE POLICY "Property owners can manage tenants of their properties" ON public.tenants
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
