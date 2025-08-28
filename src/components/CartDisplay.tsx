import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Package } from 'lucide-react';
import { CartItem as CartItemComponent } from './CartItem';
import { type CartItem } from '@/hooks/useSales';

interface CartDisplayProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveFromCart: (id: string) => void;
  onApplyDiscount: (id: string, discount: number) => void;
}

export function CartDisplay({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onApplyDiscount
}: CartDisplayProps) {
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShoppingCart className="h-5 w-5" />
          Carrinho de Compras
          {cart.length > 0 && (
            <Badge variant="secondary">
              {getTotalItems()} itens
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
            <p className="text-sm">
              Use a pesquisa acima para adicionar produtos ao carrinho
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3 pr-4">
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
  );
}