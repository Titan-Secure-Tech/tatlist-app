-- Finalize user creation triggers and policies
-- This ensures the auto-user creation works properly after all tables are created

-- Ensure the policy for user creation via trigger exists
DROP POLICY IF EXISTS "Allow trigger to create users" ON public.users;
CREATE POLICY "Allow trigger to create users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, business_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.email),
      'customer'
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- User already exists, do nothing
      NULL;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth user creation
      RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();