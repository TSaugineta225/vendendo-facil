import { useState } from "react";
import { toast } from "sonner";
import { PDVHeader } from "@/components/PDVHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { OrderSummary } from "@/components/OrderSummary";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { useSales, type CartItem } from "@/hooks/useSales";
import { type PaymentMethod } from "@/components/PaymentMethodButton";

export default function PDV() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | "">("");
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const { products, loading: productsLoading } = useProducts();
  const { settings } = useSettings();
  const { processSale, loading: saleLoading } = useSales();

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        toast.success(`${product.name} adicionado ao carrinho!`);
      } else {
        toast.error("Estoque insuficiente!");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} adicionado ao carrinho!`);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      const product = products.find(p => p.id === id);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        toast.error("Quantidade excede o estoque disponível!");
      }
    }
  };

  const applyDiscount = (id: string, discount: number) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, discount } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success("Item removido do carrinho");
  };

  const getTotalPrice = () => {
    const subtotal = cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount ? (itemTotal * item.discount) / 100 : 0;
      return total + (itemTotal - itemDiscount);
    }, 0);
    
    const taxAmount = (subtotal * parseFloat(settings.tax_rate)) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }
    if (!selectedPayment) {
      toast.error("Selecione um método de pagamento!");
      return;
    }
    
    try {
      await processSale(
        cart,
        selectedPayment,
        discountAmount,
        parseFloat(settings.tax_rate)
      );
      
      // Clear cart after successful sale
      setCart([]);
      setSelectedPayment("");
      setDiscountAmount(0);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const printReceipt = () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }
    toast.success("Recibo visualizado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header estilo Odoo */}
        <PDVHeader
          currencySymbol={settings.currency_symbol}
          currency={settings.currency}
          companyName={settings.company_name}
          cartCount={getTotalItems()}
          cartTotal={getTotalPrice()}
        />

        {/* Layout principal - estilo Odoo */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Grid de produtos - 4/7 do espaço em telas grandes */}
          <div className="lg:col-span-5 space-y-4">
            <ProductGrid
              products={products}
              loading={productsLoading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddToCart={addToCart}
            />
          </div>

          {/* Resumo do pedido - 3/7 do espaço em telas grandes */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <OrderSummary
                cart={cart}
                selectedPayment={selectedPayment}
                discountAmount={discountAmount}
                currencySymbol={settings.currency_symbol}
                taxRate={settings.tax_rate}
                saleLoading={saleLoading}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onApplyDiscount={applyDiscount}
                onSetSelectedPayment={setSelectedPayment}
                onSetDiscountAmount={setDiscountAmount}
                onHandlePayment={handlePayment}
                onPrintReceipt={printReceipt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}