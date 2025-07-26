-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'driver');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'failed');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
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

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_lists table
CREATE TABLE public.inventory_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_list_items table
CREATE TABLE public.inventory_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_list_id UUID NOT NULL REFERENCES public.inventory_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_list_id, product_id)
);

-- Create favorites table (for hearted products)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
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
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE public.deliveries (
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
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_lists_updated_at BEFORE UPDATE ON public.inventory_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_inventory_list_items_list_id ON public.inventory_list_items(inventory_list_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Only admins can modify products
CREATE POLICY "Only admins can insert products" ON public.products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

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