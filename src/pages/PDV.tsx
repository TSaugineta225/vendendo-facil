import { useState } from "react";
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
  Printer
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  { id: "1", name: "Coca-Cola 350ml", price: 2.50, stock: 50, category: "Bebidas" },
  { id: "2", name: "Pão Francês", price: 0.50, stock: 100, category: "Padaria" },
  { id: "3", name: "Leite Integral 1L", price: 4.20, stock: 30, category: "Laticínios" },
  { id: "4", name: "Arroz 5kg", price: 25.90, stock: 20, category: "Grãos" },
  { id: "5", name: "Feijão Preto 1kg", price: 8.50, stock: 15, category: "Grãos" },
];

export default function PDV() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      const product = mockProducts.find(p => p.id === id);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        toast.error("Quantidade excede o estoque disponível!");
      }
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }
    if (!selectedPayment) {
      toast.error("Selecione um método de pagamento!");
      return;
    }
    
    // Here you would integrate with payment systems
    toast.success(`Venda finalizada! Pagamento via ${selectedPayment}`);
    setCart([]);
    setSelectedPayment("");
  };

  const printReceipt = () => {
    toast.success("Recibo enviado para impressão!");
  };

  return (
    <div className="p-6 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Estoque: {product.stock}
                      </span>
                    </div>
                    <Button 
                      onClick={() => addToCart(product)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} cada
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-pdv-total">${getTotalPrice().toFixed(2)}</span>
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
              <Button
                variant={selectedPayment === "dinheiro" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPayment("dinheiro")}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Dinheiro
              </Button>
              <Button
                variant={selectedPayment === "visa" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPayment("visa")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Visa
              </Button>
              <Button
                variant={selectedPayment === "mpesa" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPayment("mpesa")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                M-Pesa
              </Button>
              <Button
                variant={selectedPayment === "mmola" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPayment("mmola")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                M-Mola
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handlePayment}
              className="w-full bg-pdv-button hover:bg-pdv-button-hover"
              size="lg"
            >
              Finalizar Venda
            </Button>
            <Button
              onClick={printReceipt}
              variant="outline"
              className="w-full"
              size="lg"
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