-- Add new fields to users table for enhanced sign-up form
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('shop_owner', 'tattoo_artist')),
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS tax_id text;

-- Add comment for documentation
COMMENT ON COLUMN public.users.user_type IS 'Whether the user is a shop owner or tattoo artist';
COMMENT ON COLUMN public.users.shop_name IS 'Required if user_type is shop_owner';
COMMENT ON COLUMN public.users.tax_id IS 'Tax identification number, required if user_type is shop_owner';
