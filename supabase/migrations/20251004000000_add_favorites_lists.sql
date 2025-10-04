-- Migration to add favorites lists functionality
-- This extends the existing favorites system to support named lists

-- Create favorites_lists table
CREATE TABLE IF NOT EXISTS public.favorites_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create favorites_list_items table (replaces the simple favorites table functionality)
CREATE TABLE IF NOT EXISTS public.favorites_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favorites_list_id UUID NOT NULL REFERENCES public.favorites_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(favorites_list_id, product_id)
);

-- Migrate existing favorites to a default "Favorites" list for each user
INSERT INTO public.favorites_lists (user_id, name)
SELECT DISTINCT user_id, 'My Favorites'
FROM public.favorites
ON CONFLICT (user_id, name) DO NOTHING;

-- Migrate existing favorites to the new structure
INSERT INTO public.favorites_list_items (favorites_list_id, product_id, created_at)
SELECT fl.id, f.product_id, f.created_at
FROM public.favorites f
JOIN public.favorites_lists fl ON f.user_id = fl.user_id AND fl.name = 'My Favorites'
ON CONFLICT (favorites_list_id, product_id) DO NOTHING;

-- Add updated_at trigger for favorites_lists
DROP TRIGGER IF EXISTS update_favorites_lists_updated_at ON public.favorites_lists;
CREATE TRIGGER update_favorites_lists_updated_at BEFORE UPDATE ON public.favorites_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_lists_user_id ON public.favorites_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_list_items_list_id ON public.favorites_list_items(favorites_list_id);
CREATE INDEX IF NOT EXISTS idx_favorites_list_items_product_id ON public.favorites_list_items(product_id);

-- Enable RLS
ALTER TABLE public.favorites_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites_lists
CREATE POLICY "Users can view own favorites lists" ON public.favorites_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites lists" ON public.favorites_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites lists" ON public.favorites_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites lists" ON public.favorites_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites_list_items
CREATE POLICY "Users can view own favorites list items" ON public.favorites_list_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.favorites_lists WHERE id = favorites_list_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own favorites list items" ON public.favorites_list_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.favorites_lists WHERE id = favorites_list_id AND user_id = auth.uid()
  ));

-- Service role policies
CREATE POLICY "Service role can manage favorites lists" ON public.favorites_lists
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage favorites list items" ON public.favorites_list_items
  FOR ALL USING (auth.role() = 'service_role');

-- Note: Keep the existing favorites table for backward compatibility
-- It can be dropped in a future migration once all code is updated