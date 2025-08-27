import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Sale {
  id: string;
  customer_id?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  cashier_id?: string;
  created_at: string;
  sale_items?: SaleItem[];
  customers?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
  products?: {
    name: string;
    category: string;
  };
}

export function useSalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers (name, email, phone),
          sale_items (
            *,
            products (name, category)
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Erro ao carregar histórico de vendas');
    } finally {
      setLoading(false);
    }
  };

  const getTodaysSales = async () => {
    const today = new Date().toISOString().split('T')[0];
    await fetchSales(today);
  };

  const getSaleById = async (saleId: string): Promise<Sale | null> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name, email, phone),
          sale_items (
            *,
            products (name, category)
          )
        `)
        .eq('id', saleId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      toast.error('Erro ao carregar venda');
      return null;
    }
  };

  const getSalesStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(sale => 
      sale.created_at.startsWith(today)
    );

    const totalSales = todaysSales.length;
    const totalRevenue = todaysSales.reduce(
      (sum, sale) => sum + sale.total_amount, 0
    );
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      avgSale,
      todaysSales: todaysSales.slice(0, 10) // Last 10 sales
    };
  };

  useEffect(() => {
    getTodaysSales();
  }, []);

  return {
    sales,
    loading,
    fetchSales,
    getTodaysSales,
    getSaleById,
    getSalesStats
  };
}