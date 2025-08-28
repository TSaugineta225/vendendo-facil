-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  
  -- Assign default viewer role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all operations on sales" ON public.sales;
DROP POLICY IF EXISTS "Allow all operations on sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on cash_register" ON public.cash_register;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create secure RLS policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for products
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage products" ON public.products
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'cashier')
  );

-- Create secure RLS policies for customers
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage customers" ON public.customers
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'cashier')
  );

-- Create secure RLS policies for sales
CREATE POLICY "Authenticated users can view sales" ON public.sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can create sales" ON public.sales
  FOR INSERT TO authenticated WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'cashier'))
    AND cashier_id = auth.uid()
  );

CREATE POLICY "Admins can manage all sales" ON public.sales
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for sale_items
CREATE POLICY "Authenticated users can view sale items" ON public.sale_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage sale items" ON public.sale_items
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'cashier')
  );

-- Create secure RLS policies for settings
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All users can view settings" ON public.settings
  FOR SELECT TO authenticated USING (true);

-- Create secure RLS policies for cash_register
CREATE POLICY "Authenticated users can view cash register" ON public.cash_register
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and cashiers can manage cash register" ON public.cash_register
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'cashier')
  );