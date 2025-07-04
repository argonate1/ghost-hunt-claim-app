-- Assign admin role to nathan@devolvedai.com
-- First, find the user ID for nathan@devolvedai.com and assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.user_id, 
  'admin'::app_role
FROM public.profiles p
WHERE p.email = 'nathan@devolvedai.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id AND ur.role = 'admin'
);

-- Create a trigger to automatically assign admin role to nathan@devolvedai.com when they sign up
CREATE OR REPLACE FUNCTION public.handle_nathan_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if this is nathan@devolvedai.com
  IF NEW.email = 'nathan@devolvedai.com' THEN
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profiles
CREATE TRIGGER assign_nathan_admin_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_nathan_admin_role();