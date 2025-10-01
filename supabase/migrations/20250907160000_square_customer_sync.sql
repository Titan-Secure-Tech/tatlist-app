-- Create table to link Supabase auth users with Square customers
CREATE TABLE IF NOT EXISTS public.square_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  square_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  given_name TEXT,
  family_name TEXT,
  phone_number TEXT,
  company_name TEXT,
  address JSONB,
  reference_id TEXT, -- Our user_id stored in Square
  created_in_square_at TIMESTAMPTZ,
  updated_in_square_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active', -- 'active', 'failed', 'deleted'
  sync_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_square_customers_user_id ON public.square_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_square_customers_square_customer_id ON public.square_customers(square_customer_id);
CREATE INDEX IF NOT EXISTS idx_square_customers_email ON public.square_customers(email);
CREATE INDEX IF NOT EXISTS idx_square_customers_sync_status ON public.square_customers(sync_status);
CREATE INDEX IF NOT EXISTS idx_square_customers_last_synced_at ON public.square_customers(last_synced_at);

-- Create table for tracking customer sync operations
CREATE TABLE IF NOT EXISTS public.square_customer_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL, -- 'scheduled', 'manual', 'webhook', 'checkout'
  sync_direction TEXT NOT NULL, -- 'supabase_to_square', 'square_to_supabase', 'bidirectional'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'partial'
  customers_created INTEGER DEFAULT 0,
  customers_updated INTEGER DEFAULT 0,
  customers_matched INTEGER DEFAULT 0,
  customers_failed INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'
);

-- Create index for sync logs
CREATE INDEX IF NOT EXISTS idx_square_customer_sync_logs_status ON public.square_customer_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_square_customer_sync_logs_started_at ON public.square_customer_sync_logs(started_at DESC);

-- Add Square customer ID to orders table if not exists
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS square_customer_id TEXT;

-- Create index for Square customer ID in orders
CREATE INDEX IF NOT EXISTS idx_orders_square_customer_id ON public.orders(square_customer_id);

-- Enable RLS for new tables
ALTER TABLE public.square_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_customer_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for square_customers
CREATE POLICY "Users can view their own Square customer link" ON public.square_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage Square customers" ON public.square_customers
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for sync logs (admin only)
CREATE POLICY "Service role can manage customer sync logs" ON public.square_customer_sync_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get or create Square customer for a user
CREATE OR REPLACE FUNCTION get_or_create_square_customer_id(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_square_customer_id TEXT;
BEGIN
  -- Check if Square customer already exists for this user
  SELECT square_customer_id INTO v_square_customer_id
  FROM public.square_customers
  WHERE user_id = p_user_id
  AND sync_status = 'active'
  LIMIT 1;
  
  RETURN v_square_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_square_customers_updated_at
  BEFORE UPDATE ON public.square_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to match users by email
CREATE OR REPLACE FUNCTION match_square_customer_to_user(p_email TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(p_email))
  LIMIT 1;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View to see unlinked Supabase users (users without Square customers)
CREATE OR REPLACE VIEW public.unlinked_supabase_users AS
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.created_at as user_created_at,
  p.first_name,
  p.last_name,
  p.phone
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
LEFT JOIN public.square_customers sc ON u.id = sc.user_id AND sc.sync_status = 'active'
WHERE sc.id IS NULL
AND u.email IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.unlinked_supabase_users TO authenticated;
GRANT SELECT ON public.unlinked_supabase_users TO service_role;