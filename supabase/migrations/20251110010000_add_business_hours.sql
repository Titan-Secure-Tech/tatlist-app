-- Add business_hours column to users table
-- Stores hours as JSONB with structure:
-- {
--   "monday": { "open": "09:00", "close": "18:00", "closed": false },
--   "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
--   "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
--   "thursday": { "open": "09:00", "close": "18:00", "closed": false },
--   "friday": { "open": "09:00", "close": "18:00", "closed": false },
--   "saturday": { "open": "10:00", "close": "16:00", "closed": false },
--   "sunday": { "closed": true }
-- }

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.users.business_hours IS 'Shop business hours for tattoo shops (JSON object with days of week as keys)';

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_users_business_hours ON public.users USING gin(business_hours);
