import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerBasic {
  id: string;
  name: string;
}

export function useCustomerLookup() {
  const [customers, setCustomers] = useState<CustomerBasic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomersForTransaction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_customers_for_transaction');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = async (customerId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_customer_name_by_id', { customer_uuid: customerId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer name:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCustomersForTransaction();
  }, []);

  return {
    customers,
    loading,
    refetch: fetchCustomersForTransaction,
    getCustomerName
  };
}