-- Create business_details table for storing validated tattoo shop information
CREATE TABLE IF NOT EXISTS public.business_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_miles DECIMAL(5, 2),
  is_validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_license_number UNIQUE (license_number),
  CONSTRAINT unique_user_business UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_business_details_user_id ON public.business_details(user_id);
CREATE INDEX idx_business_details_license_number ON public.business_details(license_number);

-- Add RLS policies
ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own business details
CREATE POLICY "Users can view own business details" 
  ON public.business_details
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own business details
CREATE POLICY "Users can insert own business details" 
  ON public.business_details
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own business details
CREATE POLICY "Users can update own business details" 
  ON public.business_details
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update orders table to reference business details
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS business_details_id UUID REFERENCES public.business_details(id),
ADD COLUMN IF NOT EXISTS delivery_distance_miles DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_details_updated_at
  BEFORE UPDATE ON public.business_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();