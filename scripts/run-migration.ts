import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://yzpiadsnllrycdfxlneb.supabase.co';
const supabaseServiceKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlhZHNubGxyeWNkZnhsbmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MTk3MywiZXhwIjoyMDY5MDM3OTczfQ.ACpxpS6U1_nIlxktAvGiUoUyozPRoPez-SXP1M9Zmb0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migration: string = `
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
`;

async function runMigration(): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: migration });
    
    if (error) {
      console.error('Migration failed:', error);
    } else {
      console.log('Migration completed successfully');
    }
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

runMigration();