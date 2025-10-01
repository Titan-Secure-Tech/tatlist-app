-- Fix inventory_lists RLS policies
-- This migration ensures RLS policies exist for inventory_lists table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can create own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can update own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Users can delete own inventory lists" ON public.inventory_lists;
DROP POLICY IF EXISTS "Service role can manage inventory lists" ON public.inventory_lists;

-- Ensure RLS is enabled
ALTER TABLE public.inventory_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_lists
CREATE POLICY "Users can view own inventory lists" ON public.inventory_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory lists" ON public.inventory_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory lists" ON public.inventory_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory lists" ON public.inventory_lists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage inventory lists" ON public.inventory_lists
  FOR ALL USING (auth.role() = 'service_role');

-- Also ensure inventory_list_items policies exist
DROP POLICY IF EXISTS "Users can view own inventory list items" ON public.inventory_list_items;
DROP POLICY IF EXISTS "Users can manage own inventory list items" ON public.inventory_list_items;
DROP POLICY IF EXISTS "Service role can manage inventory list items" ON public.inventory_list_items;

ALTER TABLE public.inventory_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory list items" ON public.inventory_list_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own inventory list items" ON public.inventory_list_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage inventory list items" ON public.inventory_list_items
  FOR ALL USING (auth.role() = 'service_role');
