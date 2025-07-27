-- Fix security definer function by setting search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'user')
  );
  RETURN NEW;
END;
$$;

-- Create helper function to get user role (security definer)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER SET search_path = 'public'
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update mentor policies to use the helper function
DROP POLICY IF EXISTS "Mentors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Mentors can view all tests" ON public.career_tests;
DROP POLICY IF EXISTS "Mentors can view all reports" ON public.career_reports;

CREATE POLICY "Mentors can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'mentor');

CREATE POLICY "Mentors can view all tests" ON public.career_tests
  FOR SELECT USING (public.get_current_user_role() = 'mentor');

CREATE POLICY "Mentors can view all reports" ON public.career_reports
  FOR SELECT USING (public.get_current_user_role() = 'mentor');