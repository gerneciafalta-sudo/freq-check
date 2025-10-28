-- Drop and recreate the trigger function with proper type handling
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value TEXT;
BEGIN
  -- Get the user_type from metadata as text
  user_type_value := COALESCE(new.raw_user_meta_data->>'user_type', 'aluno');
  
  -- Insert into profiles with explicit cast
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    new.email,
    user_type_value::user_type
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();