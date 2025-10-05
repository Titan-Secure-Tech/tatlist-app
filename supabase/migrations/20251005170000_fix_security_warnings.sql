-- Fix Security Advisor Warnings
-- This migration addresses three security issues:
-- 1. auth_users_exposed: Remove anon access from unlinked_supabase_users view
-- 2. security_definer_view: Convert view to SECURITY INVOKER
-- 3. rls_disabled_in_public: Enable RLS on sandbox_users table

-- ====================
-- Fix 1 & 2: Recreate unlinked_supabase_users view as SECURITY INVOKER
-- ====================

-- Drop the existing view
DROP VIEW IF EXISTS public.unlinked_supabase_users;

-- Recreate the view with SECURITY INVOKER (enforces caller's permissions)
-- This prevents exposing auth.users data to unauthorized users
CREATE OR REPLACE VIEW public.unlinked_supabase_users
WITH (security_invoker = true) AS
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

-- Revoke any existing grants
REVOKE ALL ON public.unlinked_supabase_users FROM anon;
REVOKE ALL ON public.unlinked_supabase_users FROM authenticated;
REVOKE ALL ON public.unlinked_supabase_users FROM public;

-- Grant access only to service_role for administrative purposes
GRANT SELECT ON public.unlinked_supabase_users TO service_role;

-- Add helpful comment
COMMENT ON VIEW public.unlinked_supabase_users IS 'Admin-only view to identify Supabase users without linked Square customers. Uses SECURITY INVOKER to enforce caller permissions.';

-- ====================
-- Fix 3: Enable RLS on sandbox_users table
-- ====================

-- Enable RLS
ALTER TABLE public.sandbox_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can manage sandbox users" ON public.sandbox_users;
DROP POLICY IF EXISTS "Authenticated users can check their sandbox status" ON public.sandbox_users;

-- Policy 1: Service role has full access
CREATE POLICY "Service role can manage sandbox users"
ON public.sandbox_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Authenticated users can only view their own sandbox status
CREATE POLICY "Authenticated users can check their sandbox status"
ON public.sandbox_users
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update table comment
COMMENT ON TABLE public.sandbox_users IS 'Users designated for Square sandbox testing. RLS enforced - users can only view their own status.';
