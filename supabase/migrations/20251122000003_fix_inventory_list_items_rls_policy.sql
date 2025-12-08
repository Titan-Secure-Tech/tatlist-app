-- Fix RLS policy for inventory_list_items table to properly support INSERT operations
-- Same issue - needs WITH CHECK clause for INSERT

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage own inventory list items" ON public.inventory_list_items;

-- Recreate with proper WITH CHECK clause for INSERT operations
CREATE POLICY "Users can manage own inventory list items" ON public.inventory_list_items
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.inventory_lists WHERE id = inventory_list_id AND user_id = auth.uid()
  ));

-- Verify the policy was created correctly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inventory_list_items'
    AND policyname = 'Users can manage own inventory list items'
  ) THEN
    RAISE NOTICE 'RLS policy "Users can manage own inventory list items" successfully updated';
  ELSE
    RAISE WARNING 'Failed to create RLS policy for inventory_list_items table';
  END IF;
END $$;
