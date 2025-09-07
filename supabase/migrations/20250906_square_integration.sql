-- Add Square-specific fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS square_catalog_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS square_variation_id TEXT,
ADD COLUMN IF NOT EXISTS square_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'manual';

-- Create index for Square catalog ID
CREATE INDEX IF NOT EXISTS idx_products_square_catalog_id ON public.products(square_catalog_id);

-- Add Square-specific fields to existing orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS square_order_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS square_payment_id TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS delivery_address JSONB,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS square_receipt_url TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Create indexes for orders (only if column exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'square_order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_orders_square_order_id ON public.orders(square_order_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Create order_items table for normalized order data
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  square_catalog_id TEXT,
  square_variation_id TEXT,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Create square_webhooks table for webhook event tracking
CREATE TABLE IF NOT EXISTS public.square_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  merchant_id TEXT,
  location_id TEXT,
  entity_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for webhook events
CREATE INDEX IF NOT EXISTS idx_square_webhooks_event_id ON public.square_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_square_webhooks_entity_id ON public.square_webhooks(entity_id);
CREATE INDEX IF NOT EXISTS idx_square_webhooks_processed ON public.square_webhooks(processed);

-- Create square_sync_logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS public.square_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL, -- 'products', 'orders', 'inventory'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_details TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Enable RLS for new tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt()->>'email' = customer_email);

DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
    )
  );

CREATE POLICY "Service role can manage order items" ON public.order_items
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for webhooks and sync logs (admin only)
CREATE POLICY "Service role can manage webhooks" ON public.square_webhooks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage sync logs" ON public.square_sync_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at triggers for new tables
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate order number with format: ORD-YYYYMMDD-XXXX
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if order number exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_order_number) INTO order_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT order_exists;
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();