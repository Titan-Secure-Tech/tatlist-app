-- Add delivery address fields to users table
-- This allows users to specify a different delivery address from their business address
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS delivery_street_address text,
  ADD COLUMN IF NOT EXISTS delivery_city text,
  ADD COLUMN IF NOT EXISTS delivery_state text,
  ADD COLUMN IF NOT EXISTS delivery_zip_code text,
  ADD COLUMN IF NOT EXISTS use_business_address_for_delivery boolean DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.users.delivery_street_address IS 'Optional delivery address street - if different from business address';
COMMENT ON COLUMN public.users.delivery_city IS 'Optional delivery address city - if different from business address';
COMMENT ON COLUMN public.users.delivery_state IS 'Optional delivery address state - if different from business address';
COMMENT ON COLUMN public.users.delivery_zip_code IS 'Optional delivery address zip code - if different from business address';
COMMENT ON COLUMN public.users.use_business_address_for_delivery IS 'If true, use business address for delivery. If false, use delivery address fields';