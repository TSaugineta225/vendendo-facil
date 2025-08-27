import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Percent,
  Receipt,
  User,
  Calculator
} from 'lucide-react';
import { CartItem as CartItemComponent } from './CartItem';
import { PaymentMethodButton } from './PaymentMethodButton';
import { type CartItem } from '@/hooks/useSales';
import { type PaymentMethod } from './PaymentMethodButton';
import { CreditCard, DollarSign, Smartphone } from 'lucide-react';

interface OrderSummaryProps {
  cart: CartItem[];
  selectedPayment: PaymentMethod | "";
  discountAmount: number;
  currencySymbol: string;
  taxRate: string;
  saleLoading: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveFromCart: (id: string) => void;
  onApplyDiscount: (id: string, discount: number) => void;
  onSetSelectedPayment: (method: PaymentMethod) => void;
  onSetDiscountAmount: (amount: number) => void;
  onHandlePayment: () => void;
  onPrintReceipt: () => void;
}

export function OrderSummary({
  cart,
  selectedPayment,
  discountAmount,
  currencySymbol,
  taxRate,
  saleLoading,
  onUpdateQuantity,
  onRemoveFromCart,
  onApplyDiscount,
  onSetSelectedPayment,
  onSetDiscountAmount,
  onHandlePayment,
  onPrintReceipt
}: OrderSummaryProps) {
  const [customerName, setCustomerName] = useState("");

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount ? (itemTotal * item.discount) / 100 : 0;
      return total + (itemTotal - itemDiscount);
    }, 0);
  };

  const getTaxAmount = () => {
    return (getSubtotal() * parseFloat(taxRate)) / 100;
  };

  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    const taxAmount = getTaxAmount();
    return subtotal + taxAmount - discountAmount;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="space-y-4">
      {/* Order Header */}
      <Card className="bg-gradient-to-r from-pdv-button/5 to-pdv-accent/5 border-pdv-button/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-pdv-button">
            <ShoppingCart className="h-5 w-5" />
            Pedido Atual
            {cart.length > 0 && (
              <Badge className="bg-pdv-button text-white">
                {getTotalItems()} itens
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-pdv-button" />
            <span className="text-sm font-medium">Cliente (Opcional)</span>
          </div>
          <Input
            placeholder="Nome do cliente..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border-pdv-button/20 focus:border-pdv-button"
          />
        </CardContent>
      </Card>

      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Itens do Carrinho</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveFromCart}
                    onApplyDiscount={onApplyDiscount}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Order Totals */}
      {cart.length > 0 && (
        <Card className="border-pdv-button/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pdv-button">
              <Calculator className="h-5 w-5" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">{currencySymbol} {getSubtotal().toFixed(2)}</span>
            </div>

            {/* Discount Input */}
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">Desconto:</span>
              <Input
                type="number"
                value={discountAmount}
                onChange={(e) => onSetDiscountAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-24 h-8 text-sm text-right"
                min="0"
                step="0.01"
              />
              <span className="text-sm text-pdv-success">
                -{currencySymbol} {discountAmount.toFixed(2)}
              </span>
            </div>

            {parseFloat(taxRate) > 0 && (
              <div className="flex justify-between text-sm">
                <span>IVA ({taxRate}%):</span>
                <span className="font-medium">{currencySymbol} {getTaxAmount().toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>TOTAL:</span>
              <span className="text-pdv-button">
                {currencySymbol} {getTotalPrice().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
            onSelect={onSetSelectedPayment}
          />
          <PaymentMethodButton
            method="visa"
            label="Visa/Mastercard"
            icon={CreditCard}
            selected={selectedPayment === "visa"}
            onSelect={onSetSelectedPayment}
          />
          <PaymentMethodButton
            method="mpesa"
            label="M-Pesa"
            icon={Smartphone}
            selected={selectedPayment === "mpesa"}
            onSelect={onSetSelectedPayment}
          />
          <PaymentMethodButton
            method="mmola"
            label="M-Mola"
            icon={Smartphone}
            selected={selectedPayment === "mmola"}
            onSelect={onSetSelectedPayment}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onHandlePayment}
          disabled={cart.length === 0 || !selectedPayment || saleLoading}
          className="w-full h-12 text-lg bg-gradient-to-r from-pdv-success to-pdv-button hover:shadow-lg transition-all"
          size="lg"
        >
          {saleLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processando...
            </div>
          ) : (
            <>
              <Receipt className="h-5 w-5 mr-2" />
              Finalizar Venda ({currencySymbol} {getTotalPrice().toFixed(2)})
            </>
          )}
        </Button>
        
        <Button
          onClick={onPrintReceipt}
          variant="outline"
          className="w-full border-pdv-button/20 hover:bg-pdv-accent text-pdv-button"
          size="lg"
          disabled={cart.length === 0}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Visualizar Recibo
        </Button>
      </div>
    </div>
  );
}