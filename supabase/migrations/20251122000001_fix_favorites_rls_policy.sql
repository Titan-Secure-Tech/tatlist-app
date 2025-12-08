-- Fix RLS policy for favorites table to properly support INSERT operations
-- The issue is that FOR ALL needs both USING and WITH CHECK clauses for INSERT to work

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;

-- Recreate with proper WITH CHECK clause for INSERT operations
CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created correctly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'favorites'
    AND policyname = 'Users can manage own favorites'
  ) THEN
    RAISE NOTICE 'RLS policy "Users can manage own favorites" successfully updated';
  ELSE
    RAISE WARNING 'Failed to create RLS policy for favorites table';
  END IF;
END $$;
