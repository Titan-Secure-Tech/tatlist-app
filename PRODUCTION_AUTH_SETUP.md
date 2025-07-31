# Production Authentication Setup

## Issue
Getting 404 errors when creating accounts in production.

## Solution Steps

### 1. Update Supabase Dashboard Settings

Go to your Supabase dashboard (https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb) and update:

1. **Authentication > URL Configuration**:
   - Site URL: `https://your-production-domain.com` (or your Vercel URL)
   - Redirect URLs: Add these URLs
     - `https://your-production-domain.com/api/auth/callback`
     - `https://your-production-domain.vercel.app/api/auth/callback`
     - `http://localhost:7500/api/auth/callback` (for local development)

2. **Authentication > Email Templates** (if using email confirmations):
   - Ensure the confirmation URL uses `{{ .SiteURL }}/api/auth/callback`

### 2. Set Environment Variables in Vercel

In your Vercel project settings, add:

```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 3. Database Migration

Run this SQL in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT,
  business_address TEXT,
  tax_exempt_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 4. Code Updates Applied

✅ Updated `app/(auth)/register/page.tsx` to use dynamic redirect URLs
✅ Updated `app/(auth)/login/page.tsx` to use dynamic redirect URLs
✅ Added proper session checking in signup flow

## Testing

After completing the above steps:

1. Clear your browser cache/cookies
2. Try creating a new account
3. Check the Supabase dashboard > Authentication > Logs for any errors

## Notes

- Email confirmations are currently disabled in local development but may be enabled in production
- The code now handles both scenarios (with and without email confirmation)
- Make sure your production domain is correctly set in all redirect URLs