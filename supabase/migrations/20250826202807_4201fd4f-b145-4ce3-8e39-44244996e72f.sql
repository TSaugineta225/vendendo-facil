-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  barcode TEXT,
  min_stock INTEGER DEFAULT 5,
  description TEXT,
  image_url TEXT,
  cost_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  cashier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash_register table
CREATE TABLE public.cash_register (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_cash DECIMAL(10,2) DEFAULT 0,
  total_card DECIMAL(10,2) DEFAULT 0,
  total_mobile DECIMAL(10,2) DEFAULT 0,
  opened_by UUID,
  closed_by UUID,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open'
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you should customize based on your auth needs)
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on cash_register" ON public.cash_register FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON public.settings FOR ALL USING (true);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('currency', 'MZN', 'Default currency code'),
('currency_symbol', 'MT', 'Currency symbol to display'),
('language', 'pt', 'Default language'),
('tax_rate', '17', 'Default tax rate percentage'),
('company_name', 'Minha Empresa', 'Company name'),
('receipt_footer', 'Obrigado pela sua preferência!', 'Footer text for receipts');

-- Insert sample products
INSERT INTO public.products (name, price, stock, category, barcode, cost_price) VALUES
('Coca-Cola 350ml', 35.00, 50, 'Bebidas', '7894900011517', 25.00),
('Pão Francês', 5.00, 100, 'Padaria', '1234567890123', 3.00),
('Leite Integral 1L', 85.00, 30, 'Laticínios', '7891000053508', 65.00),
('Arroz 5kg', 450.00, 20, 'Grãos', '7896005200123', 350.00),
('Feijão Preto 1kg', 120.00, 15, 'Grãos', '7896005300456', 90.00),
('Óleo de Cozinha 900ml', 95.00, 25, 'Condimentos', '7891150056664', 75.00),
('Açúcar Cristal 1kg', 65.00, 40, 'Açúcar', '7896029013915', 50.00),
('Sabão em Pó 1kg', 180.00, 20, 'Limpeza', '7891150071827', 140.00);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();