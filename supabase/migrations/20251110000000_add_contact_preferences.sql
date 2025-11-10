-- Create enum for contact preferences
CREATE TYPE contact_preference AS ENUM ('sms', 'email', 'both');

-- Add contact_preference column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS contact_preference contact_preference;

-- Add comment for documentation
COMMENT ON COLUMN public.users.contact_preference IS 'User preferred method for order notifications (SMS, Email, or Both)';

-- Note: We're not making it required immediately to allow existing users to set their preference
-- The application will prompt existing users who don't have a preference set
