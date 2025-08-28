import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from './useProducts';

export interface CartItem extends Product {
  quantity: number;
  discount?: number;
}

interface SaleData {
  customer_id?: string;
  cashier_id: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    total_price: number;
  }[];
}

export function useSales() {
  const [loading, setLoading] = useState(false);

  const processSale = async (
    cart: CartItem[],
    paymentMethod: string,
    discountAmount: number = 0,
    taxRate: number = 0,
    customerId?: string,
    notes?: string
  ) => {
    setLoading(true);
    
    try {
      // Input validation
      if (!cart || cart.length === 0) {
        throw new Error('Carrinho vazio');
      }
      
      if (!paymentMethod || paymentMethod.trim() === '') {
        throw new Error('Método de pagamento é obrigatório');
      }
      
      if (discountAmount < 0) {
        throw new Error('Desconto não pode ser negativo');
      }
      
      if (taxRate < 0 || taxRate > 100) {
        throw new Error('Taxa de imposto deve estar entre 0 e 100%');
      }
      
      // Validate cart items
      for (const item of cart) {
        if (item.quantity <= 0) {
          throw new Error(`Quantidade inválida para ${item.name}`);
        }
        if (item.price < 0) {
          throw new Error(`Preço inválido para ${item.name}`);
        }
        if (item.quantity > item.stock) {
          throw new Error(`Estoque insuficiente para ${item.name}`);
        }
      }
      const subtotal = cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = item.discount ? (itemTotal * item.discount) / 100 : 0;
        return sum + (itemTotal - itemDiscount);
      }, 0);

      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Get current user for cashier_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário deve estar autenticado para processar vendas');
      }

      const saleData: SaleData = {
        customer_id: customerId,
        cashier_id: user.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        payment_method: paymentMethod,
        notes,
        items: cart.map(item => {
          const itemTotal = item.price * item.quantity;
          const itemDiscountPercentage = item.discount || 0;
          const itemDiscountAmount = (itemTotal * itemDiscountPercentage) / 100;
          
          return {
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            discount_percentage: itemDiscountPercentage,
            total_price: itemTotal - itemDiscountAmount
          };
        })
      };

      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        ...item,
        sale_id: sale.id
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      toast.success(`Venda finalizada! Total: MT ${totalAmount.toFixed(2)}`);
      return sale;

    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Erro ao processar venda');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    processSale,
    loading
  };
}