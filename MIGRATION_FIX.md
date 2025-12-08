# Fix: "Failed to add to inventory" Error

## Problem
Users in production are getting a "failed to add to inventory" error because they exist in `auth.users` but not in `public.users`. The `favorites` table has a foreign key constraint that requires the user to exist in `public.users`.

## Root Cause
Existing users who signed up before the user creation trigger was properly configured only have entries in `auth.users` but not in `public.users`. When they try to favorite a product, the INSERT fails due to the foreign key constraint.

## Solution

### Step 1: Diagnose the Issue
Run this query in the Supabase SQL Editor to see how many users are affected:

```sql
-- Check for missing users
SELECT
  COUNT(DISTINCT au.id) as auth_users,
  COUNT(DISTINCT pu.id) as public_users,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT pu.id) as missing_users
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- List specific missing users
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;
```

### Step 2: Apply the Fix
Run the backfill migration in the Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/sql/new
2. Paste and run the following SQL:

```sql
-- Backfill missing users from auth.users to public.users
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

-- Verify the fix
SELECT
  COUNT(DISTINCT au.id) as auth_users,
  COUNT(DISTINCT pu.id) as public_users,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT pu.id) as remaining_missing
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;
```

### Step 3: Verify
After running the migration, ask a user who was experiencing the issue to try adding a product to their inventory again.

## Alternative: Deploy via CLI

If you have direct database access, you can push the migration:

```bash
# Try with HTTPS DNS resolver
bunx supabase db push --linked --include-all --dns-resolver https

# Or use direct database URL
bunx supabase db push --db-url "postgres://postgres:[PASSWORD]@db.yzpiadsnllrycdfxlneb.supabase.co:5432/postgres" --include-all
```

## Prevention
The trigger `handle_new_user()` in `/supabase/migrations/20250830180000_finalize_user_triggers.sql` should prevent this issue for new signups. This migration only fixes existing users.
