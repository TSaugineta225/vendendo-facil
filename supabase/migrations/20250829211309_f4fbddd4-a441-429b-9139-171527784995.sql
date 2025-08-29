-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION validate_sales_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION validate_customer_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
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
$$;