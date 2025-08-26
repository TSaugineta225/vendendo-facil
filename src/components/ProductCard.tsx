import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, BarChart3, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  minStock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onEdit }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isLowStock = product.stock <= (product.minStock || 5);
  
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("Produto fora de estoque!");
      return;
    }
    onAddToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
        isLowStock ? 'border-pdv-warning/50 bg-pdv-warning/5' : 'border-border hover:border-pdv-button/30'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                {product.name}
              </h3>
              {product.barcode && (
                <div className="flex items-center gap-1 mt-1">
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{product.barcode}</span>
                </div>
              )}
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs bg-pdv-accent text-pdv-button border-pdv-button/20"
            >
              {product.category}
            </Badge>
          </div>

          {/* Price and Stock */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-pdv-button">
                ${product.price.toFixed(2)}
              </span>
              {isLowStock && (
                <div className="text-xs text-pdv-warning font-medium">
                  ⚠️ Estoque baixo
                </div>
              )}
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${
                product.stock <= 0 ? 'text-pdv-danger' : 
                isLowStock ? 'text-pdv-warning' : 'text-muted-foreground'
              }`}>
                {product.stock} unidades
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 transition-all ${
                product.stock <= 0 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pdv-success to-pdv-button hover:shadow-md'
              }`}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {product.stock <= 0 ? 'Esgotado' : 'Adicionar'}
            </Button>
            
            {isHovered && onEdit && (
              <Button
                onClick={() => onEdit(product)}
                variant="outline"
                size="sm"
                className="border-pdv-button/20 hover:bg-pdv-accent"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          {isHovered && (
            <div className="flex justify-center pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-pdv-button"
              >
                <QrCode className="h-3 w-3 mr-1" />
                Ver QR Code
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}