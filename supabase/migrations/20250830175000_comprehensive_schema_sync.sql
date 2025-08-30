-- Comprehensive schema sync migration
-- This migration adds all missing tables and components from schema.sql
-- while preserving existing products table and data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types if they don't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin', 'driver');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_address TEXT,
  tax_exempt_status BOOLEAN DEFAULT false,
  tax_exempt_document TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_lists table
CREATE TABLE IF NOT EXISTS public.inventory_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_list_items table
CREATE TABLE IF NOT EXISTS public.inventory_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_list_id UUID NOT NULL REFERENCES public.inventory_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_list_id, product_id)
);

-- Create favorites table (for hearted products)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2),
  total DECIMAL(10, 2) NOT NULL,
  fulfillment_type fulfillment_type NOT NULL,
  delivery_address JSONB,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.users(id),
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  route JSONB,
  status delivery_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart_items table (for persistent cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create updated_at trigger function (reuse existing if it exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_lists_updated_at ON public.inventory_lists;
CREATE TRIGGER update_inventory_lists_updated_at BEFORE UPDATE ON public.inventory_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_list_items_list_id ON public.inventory_list_items(inventory_list_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can create own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can update own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can delete own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can view own inventory list items" ON public.inventory_list_items;
DROP POLICY IF EXISTS "Users can manage own inventory list items" ON public.inventory_list_items;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;

-- RLS Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own inventory lists
CREATE POLICY "Users can view own inventory lists" ON public.inventory_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory lists" ON public.inventory_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory lists" ON public.inventory_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory lists" ON public.inventory_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Users can manage items in their inventory lists
CREATE POLICY "Users can view own inventory list items" ON public.inventory_list_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own inventory list items" ON public.inventory_list_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ));

-- Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view order items for their orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()
  ));

-- Users can manage their own cart
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Allow service role to manage all tables (for imports and admin functions)
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage inventory lists" ON public.inventory_lists
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage inventory list items" ON public.inventory_list_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage favorites" ON public.favorites
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage order items" ON public.order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage deliveries" ON public.deliveries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage cart items" ON public.cart_items
  FOR ALL USING (auth.role() = 'service_role');