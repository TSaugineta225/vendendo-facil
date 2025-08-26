import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  isAvailable: boolean;
  processingFee?: number;
}

interface PaymentMethodButtonProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: (methodId: string) => void;
  total?: number;
}

export function PaymentMethodButton({ 
  method, 
  isSelected, 
  onSelect, 
  total = 0 
}: PaymentMethodButtonProps) {
  const processingFeeAmount = method.processingFee ? (total * method.processingFee) / 100 : 0;
  const finalTotal = total + processingFeeAmount;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`w-full justify-start p-4 h-auto transition-all ${
        isSelected 
          ? `bg-gradient-to-r ${method.color} text-white shadow-lg scale-105` 
          : `hover:bg-accent hover:scale-105 border-2 ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`
      }`}
      onClick={() => method.isAvailable && onSelect(method.id)}
      disabled={!method.isAvailable}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <method.icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
          <div className="text-left">
            <div className="font-medium">{method.name}</div>
            {method.processingFee && (
              <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                Taxa: {method.processingFee}%
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {!method.isAvailable && (
            <Badge variant="destructive" className="text-xs">
              Indisponível
            </Badge>
          )}
          {method.processingFee && processingFeeAmount > 0 && (
            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
              +${processingFeeAmount.toFixed(2)}
            </div>
          )}
          {isSelected && (
            <Badge className="bg-white/20 text-white border-white/30">
              Selecionado
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );
}