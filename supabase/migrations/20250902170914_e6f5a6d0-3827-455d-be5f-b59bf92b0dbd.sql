-- Update RLS policies for customers table to implement stricter access controls

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and cashiers can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Only admins and cashiers can manage customers" ON public.customers;

-- Admin policies - full access to customer data
CREATE POLICY "Admins can manage all customer data" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Cashier policies - very limited access
-- Cashiers can only view basic customer info (name and id) for transaction purposes
CREATE POLICY "Cashiers can view limited customer data for transactions" 
ON public.customers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'cashier'::app_role) AND 
  -- This policy only allows access through specific functions/views, not direct queries
  FALSE -- We'll use a security definer function instead
);

-- Cashiers cannot insert/update/delete customer data directly
CREATE POLICY "Cashiers cannot modify customer data" 
ON public.customers 
FOR INSERT 
WITH CHECK (FALSE);

CREATE POLICY "Cashiers cannot update customer data" 
ON public.customers 
FOR UPDATE 
USING (FALSE);

CREATE POLICY "Cashiers cannot delete customer data" 
ON public.customers 
FOR DELETE 
USING (FALSE);

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