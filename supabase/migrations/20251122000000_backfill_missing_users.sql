-- Backfill missing users from auth.users to public.users
-- This fixes the "failed to add to inventory" error for existing users

-- Insert any auth users that don't exist in public.users
INSERT INTO public.users (id, email, business_name, role, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'business_name', au.email),
  'customer',
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the backfill worked
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  missing_count := auth_count - public_count;

  RAISE NOTICE 'Auth users: %, Public users: %, Backfilled: %',
    auth_count, public_count, GREATEST(0, missing_count);
END $$;
