-- Diagnostic queries for "failed to add to inventory" issue

-- 1. Check RLS policies on favorites table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'favorites';

-- 2. Check if favorites table exists and its structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'favorites'
ORDER BY ordinal_position;

-- 3. Check for any failed insert attempts (if there's an audit log)
-- This would require enabling logging on the table

-- 4. Test if a specific user can insert into favorites (replace USER_ID and PRODUCT_ID)
-- SELECT auth.uid() as current_user_id;
-- INSERT INTO public.favorites (user_id, product_id)
-- VALUES ('YOUR_USER_ID', 'A_VALID_PRODUCT_ID')
-- RETURNING *;

-- 5. Check if there are any triggers on the favorites table that might be failing
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'favorites';

-- 6. Check for foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'favorites'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 7. Sample query to test if products exist that users are trying to favorite
SELECT COUNT(*) as total_products FROM public.products;

-- 8. Check if there are any orphaned favorites (referencing non-existent products)
SELECT
  f.id,
  f.user_id,
  f.product_id,
  p.id IS NULL as product_missing
FROM public.favorites f
LEFT JOIN public.products p ON f.product_id = p.id
WHERE p.id IS NULL;
