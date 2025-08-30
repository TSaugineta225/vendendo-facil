import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PDVHeader } from "@/components/PDVHeader";
import { ProductSearch } from "@/components/ProductSearch";
import { CartDisplay } from "@/components/CartDisplay";
import { OrderSummary } from "@/components/OrderSummary";
import { AuthModal } from "@/components/AuthModal";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { useSales, type CartItem } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { type PaymentMethod } from "@/components/PaymentMethodButton";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function PDV() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | "">("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const { products, loading: productsLoading } = useProducts();
  const { settings } = useSettings();
  const { processSale, loading: saleLoading } = useSales();
  const { user, loading: authLoading, signOut } = useAuth();
  const { canProcessSales, profile, loading: profileLoading } = useProfiles();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setAuthModalOpen(true);
    }
  }, [user, authLoading]);

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

  const handleSignOut = async () => {
    await signOut();
    setCart([]);
    setSelectedPayment("");
    setDiscountAmount(0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    );
  }

  // Check if user has permission to process sales
  if (!profileLoading && !canProcessSales()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar o sistema PDV.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Entre em contato com o administrador para solicitar acesso.
          </p>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="max-w-6xl mx-auto">
        {/* Header minimalista */}
        <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="font-medium text-foreground">PDV</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Layout simples */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pesquisa e carrinho - 2/3 do espaço */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pesquisa minimalista */}
            <div className="bg-card rounded-lg border p-4">
              <ProductSearch
                products={products}
                onAddToCart={addToCart}
                loading={productsLoading}
              />
            </div>

            {/* Carrinho simplificado */}
            <CartDisplay
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onApplyDiscount={applyDiscount}
            />
          </div>

          {/* Resumo compacto */}
          <div className="lg:col-span-1">
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