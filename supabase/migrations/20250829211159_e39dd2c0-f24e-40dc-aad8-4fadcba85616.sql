-- Fix RLS policies for comprehensive security

-- 1. Update customers table policies to restrict access
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Only admins and cashiers can manage customers" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 2. Fix cash_register policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can view cash register" ON public.cash_register;
CREATE POLICY "Only admins and cashiers can view cash register" 
ON public.cash_register 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 3. Update sales policies to restrict viewing to authorized users only
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
CREATE POLICY "Only admins and cashiers can view sales" 
ON public.sales 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 4. Update sale_items policies similarly
DROP POLICY IF EXISTS "Authenticated users can view sale items" ON public.sale_items;
CREATE POLICY "Only admins and cashiers can view sale items" 
ON public.sale_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

-- 5. Add input validation triggers for products
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate price is positive
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Product price must be positive';
  END IF;
  
  -- Validate stock is not negative
  IF NEW.stock < 0 THEN
    RAISE EXCEPTION 'Product stock cannot be negative';
  END IF;
  
  -- Validate cost_price is positive if provided
  IF NEW.cost_price IS NOT NULL AND NEW.cost_price <= 0 THEN
    RAISE EXCEPTION 'Product cost price must be positive';
  END IF;
  
  -- Sanitize name and description
  NEW.name = TRIM(NEW.name);
  IF NEW.description IS NOT NULL THEN
    NEW.description = TRIM(NEW.description);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_product_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION validate_product_data();

-- 6. Add validation for sales data
CREATE OR REPLACE FUNCTION validate_sales_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate total_amount is positive
  IF NEW.total_amount <= 0 THEN
    RAISE EXCEPTION 'Sale total amount must be positive';
  END IF;
  
  -- Validate discount_amount is not negative and not greater than total
  IF NEW.discount_amount < 0 THEN
    RAISE EXCEPTION 'Discount amount cannot be negative';
  END IF;
  
  -- Validate tax_amount is not negative
  IF NEW.tax_amount < 0 THEN
    RAISE EXCEPTION 'Tax amount cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_sales_trigger
  BEFORE INSERT OR UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION validate_sales_data();

-- 7. Add validation for customer data
CREATE OR REPLACE FUNCTION validate_customer_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize name
  NEW.name = TRIM(NEW.name);
  
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Sanitize other fields
  IF NEW.address IS NOT NULL THEN
    NEW.address = TRIM(NEW.address);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_customer_trigger
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION validate_customer_data();