-- Create sandbox_users table to track which users should use sandbox mode
CREATE TABLE IF NOT EXISTS sandbox_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sandbox_users_email ON sandbox_users(email);
CREATE INDEX IF NOT EXISTS idx_sandbox_users_enabled ON sandbox_users(enabled) WHERE enabled = TRUE;

-- Add test users to sandbox list
INSERT INTO sandbox_users (email, notes) VALUES 
    ('crushjunkmail@gmail.com', 'Test user for sandbox checkout'),
    ('james@familiawashington.com', 'Test user for sandbox checkout')
ON CONFLICT (email) DO UPDATE 
SET updated_at = NOW();

-- Add comment for documentation
COMMENT ON TABLE sandbox_users IS 'Users who should see Square sandbox checkout instead of production';
COMMENT ON COLUMN sandbox_users.email IS 'User email address';
COMMENT ON COLUMN sandbox_users.enabled IS 'Whether sandbox mode is active for this user';
COMMENT ON COLUMN sandbox_users.notes IS 'Notes about why user is in sandbox mode';