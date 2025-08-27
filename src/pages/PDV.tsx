import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  DollarSign,
  Smartphone,
  Printer,
  Receipt,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { CartItem as CartItemComponent } from "@/components/CartItem";
import { PaymentMethodButton } from "@/components/PaymentMethodButton";
import { SettingsModal } from "@/components/SettingsModal";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { useSales, type CartItem } from "@/hooks/useSales";
import { type PaymentMethod } from "@/components/PaymentMethodButton";

// Debug: Check if icons are properly imported
console.log('Icon imports check:', { DollarSign, CreditCard, Smartphone });

export default function PDV() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | "">("");
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const { products, loading: productsLoading, updateStock } = useProducts();
  const { settings } = useSettings();
  const { processSale, loading: saleLoading } = useSales();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error("Estoque insuficiente!");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
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

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount ? (itemTotal * item.discount) / 100 : 0;
      return total + (itemTotal - itemDiscount);
    }, 0);
  };

  const getTaxAmount = () => {
    return (getSubtotal() * parseFloat(settings.tax_rate)) / 100;
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
    toast.success("Recibo enviado para impressão!");
  };

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-pdv-button">Ponto de Venda</h1>
        <div className="flex gap-2">
          <SettingsModal />
          <Badge variant="outline" className="bg-pdv-accent text-pdv-button">
            {settings.currency_symbol} {settings.currency}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produtos, código de barras ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {productsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pdv-button"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart and Payment Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrinho de Compras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      onApplyDiscount={applyDiscount}
                    />
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{settings.currency_symbol} {getSubtotal().toFixed(2)}</span>
                </div>
                
                {parseFloat(settings.tax_rate) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IVA ({settings.tax_rate}%):</span>
                    <span>{settings.currency_symbol} {getTaxAmount().toFixed(2)}</span>
                  </div>
                )}
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-pdv-success">
                    <span>Desconto:</span>
                    <span>-{settings.currency_symbol} {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Total:</span>
                    <Input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Desconto"
                      className="w-20 h-8 text-xs"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span className="text-xl font-bold text-pdv-button">
                    {settings.currency_symbol} {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PaymentMethodButton
                method="dinheiro"
                label="Dinheiro"
                icon={DollarSign}
                selected={selectedPayment === "dinheiro"}
                onSelect={setSelectedPayment}
              />
              <PaymentMethodButton
                method="visa"
                label="Visa/Mastercard"
                icon={CreditCard}
                selected={selectedPayment === "visa"}
                onSelect={setSelectedPayment}
              />
              <PaymentMethodButton
                method="mpesa"
                label="M-Pesa"
                icon={Smartphone}
                selected={selectedPayment === "mpesa"}
                onSelect={setSelectedPayment}
              />
              <PaymentMethodButton
                method="mmola"
                label="M-Mola"
                icon={Smartphone}
                selected={selectedPayment === "mmola"}
                onSelect={setSelectedPayment}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handlePayment}
              disabled={cart.length === 0 || !selectedPayment || saleLoading}
              className="w-full bg-gradient-to-r from-pdv-success to-pdv-button hover:shadow-lg"
              size="lg"
            >
              {saleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </div>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Finalizar Venda
                </>
              )}
            </Button>
            <Button
              onClick={printReceipt}
              variant="outline"
              className="w-full border-pdv-button/20 hover:bg-pdv-accent"
              size="lg"
              disabled={cart.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Recibo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}