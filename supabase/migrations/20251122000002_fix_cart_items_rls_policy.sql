-- Fix RLS policy for cart_items table to properly support INSERT operations
-- Same issue as favorites table - needs WITH CHECK clause for INSERT

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;

-- Recreate with proper WITH CHECK clause for INSERT operations
CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created correctly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cart_items'
    AND policyname = 'Users can manage own cart items'
  ) THEN
    RAISE NOTICE 'RLS policy "Users can manage own cart items" successfully updated';
  ELSE
    RAISE WARNING 'Failed to create RLS policy for cart_items table';
  END IF;
END $$;
