-- Create trigger to automatically create user profile when someone signs up
-- This fixes the "Database error saving new user" issue in Supabase Auth

-- Create a function that will be triggered when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN (new.raw_user_meta_data->>'is_admin')::boolean = true THEN 'admin'
      ELSE 'user'
    END,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', public.users.full_name),
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that fires when a new user is created in the auth schema
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON public.users TO postgres, authenticated, service_role;
