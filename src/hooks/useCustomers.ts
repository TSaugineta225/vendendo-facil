import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerForTransaction {
  id: string;
  name: string;
}

export function useCustomersForTransaction() {
  const [customers, setCustomers] = useState<CustomerForTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomersForTransaction = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_customers_for_transaction');

      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers for transaction:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersForTransaction();
  }, []);

  return {
    customers,
    loading,
    refetch: fetchCustomersForTransaction
  };
}

export function useCustomerName() {
  const getCustomerName = async (customerId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_customer_name_by_id', { customer_uuid: customerId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting customer name:', error);
      return null;
    }
  };

  return { getCustomerName };
}