import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export type PaymentMethod = "dinheiro" | "visa" | "mpesa" | "mmola";

interface PaymentMethodButtonProps {
  method: PaymentMethod;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodButton({ 
  method, 
  label,
  icon: Icon,
  selected, 
  onSelect,
  disabled = false
}: PaymentMethodButtonProps) {
  const getMethodColor = () => {
    switch (method) {
      case "dinheiro": return "from-green-500 to-green-600";
      case "visa": return "from-blue-500 to-blue-600";
      case "mpesa": return "from-red-500 to-red-600";
      case "mmola": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <Button
      variant={selected ? "default" : "outline"}
      className={`w-full justify-start p-4 h-auto transition-all ${
        selected 
          ? `bg-gradient-to-r ${getMethodColor()} text-white shadow-lg scale-105` 
          : `hover:bg-pdv-accent hover:scale-105 border-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-pdv-button/20'}`
      }`}
      onClick={() => !disabled && onSelect(method)}
      disabled={disabled}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${selected ? 'text-white' : 'text-pdv-button'}`} />
          <div className="text-left">
            <div className={`font-medium ${selected ? 'text-white' : 'text-foreground'}`}>
              {label}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {disabled && (
            <Badge variant="destructive" className="text-xs">
              Indisponível
            </Badge>
          )}
          {selected && (
            <Badge className="bg-white/20 text-white border-white/30">
              ✓
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );
}