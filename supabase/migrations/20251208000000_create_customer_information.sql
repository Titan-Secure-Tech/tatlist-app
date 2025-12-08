-- Create customer_information table for storing user's business and shipping details
-- This enables profile-based customer information management with checkout auto-population

CREATE TABLE IF NOT EXISTS customer_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Business Details
  business_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,

  -- Shipping Address
  street_address TEXT NOT NULL,
  apartment_suite TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  delivery_instructions TEXT,

  -- Geocoding & Validation (from Mapbox integration)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_in_delivery_zone BOOLEAN DEFAULT FALSE,
  delivery_distance_miles DECIMAL(5, 2),
  estimated_delivery_fee DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT customer_information_user_id_unique UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_information_user_id ON customer_information(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_information_email ON customer_information(email);

-- Enable Row Level Security
ALTER TABLE customer_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own customer information
CREATE POLICY "Users can view their own customer information"
  ON customer_information FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer information"
  ON customer_information FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer information"
  ON customer_information FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer information"
  ON customer_information FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_information_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on updates
CREATE TRIGGER trigger_update_customer_information_updated_at
  BEFORE UPDATE ON customer_information
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_information_updated_at();

-- Add comment to table for documentation
COMMENT ON TABLE customer_information IS 'Stores customer business and shipping information for profile management and checkout auto-population';
