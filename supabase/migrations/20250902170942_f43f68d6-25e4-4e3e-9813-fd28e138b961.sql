-- First, let's clean up existing policies completely
DROP POLICY IF EXISTS "Admins and cashiers can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Only admins and cashiers can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customer data" ON public.customers;
DROP POLICY IF EXISTS "Cashiers can view limited customer data for transactions" ON public.customers;
DROP POLICY IF EXISTS "Cashiers cannot modify customer data" ON public.customers;
DROP POLICY IF EXISTS "Cashiers cannot update customer data" ON public.customers;
DROP POLICY IF EXISTS "Cashiers cannot delete customer data" ON public.customers;

-- Create new strict policies
-- Admin policies - full access to customer data
CREATE POLICY "Admin full customer access" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Cashiers have NO direct access to customer table
-- They must use security definer functions for limited access

-- Create a security definer function for limited customer lookup during transactions
CREATE OR REPLACE FUNCTION public.get_customers_for_transaction()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow cashiers and admins to use this function
  SELECT 
    c.id,
    c.name
  FROM public.customers c
  WHERE has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role)
  ORDER BY c.name;
$$;

-- Create a function to get customer name by ID for sales history
CREATE OR REPLACE FUNCTION public.get_customer_name_by_id(customer_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT name 
  FROM public.customers 
  WHERE id = customer_uuid 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));
$$;