-- Fix permissions for unlinked_supabase_users view
-- Grant access to anon role so server client can query it

GRANT SELECT ON public.unlinked_supabase_users TO anon;

-- Also ensure the view has proper security definer functions
-- Recreate the view with explicit permissions
DROP VIEW IF EXISTS public.unlinked_supabase_users;

CREATE OR REPLACE VIEW public.unlinked_supabase_users
WITH (security_invoker = false)
AS
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

-- Grant access to all necessary roles
GRANT SELECT ON public.unlinked_supabase_users TO anon;
GRANT SELECT ON public.unlinked_supabase_users TO authenticated;
GRANT SELECT ON public.unlinked_supabase_users TO service_role;
