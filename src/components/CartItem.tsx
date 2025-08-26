import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, Edit3 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  category: string;
  discount?: number;
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onApplyDiscount?: (id: string, discount: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove, onApplyDiscount }: CartItemProps) {
  const itemTotal = item.price * item.quantity;
  const discountAmount = item.discount ? (itemTotal * item.discount) / 100 : 0;
  const finalTotal = itemTotal - discountAmount;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>${item.price.toFixed(2)} cada</span>
          {item.discount && (
            <Badge variant="secondary" className="bg-pdv-warning/10 text-pdv-warning border-pdv-warning/20">
              -{item.discount}%
            </Badge>
          )}
        </div>
        
        {discountAmount > 0 && (
          <div className="text-xs text-pdv-success">
            Economia: ${discountAmount.toFixed(2)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="w-12 text-center text-sm font-medium">
            {item.quantity}
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Total */}
        <div className="text-right min-w-[60px]">
          {discountAmount > 0 && (
            <div className="text-xs text-muted-foreground line-through">
              ${itemTotal.toFixed(2)}
            </div>
          )}
          <div className="text-sm font-bold text-pdv-button">
            ${finalTotal.toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {onApplyDiscount && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onApplyDiscount(item.id, item.discount || 0)}
              className="h-7 w-7 p-0 hover:bg-pdv-accent"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(item.id)}
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}