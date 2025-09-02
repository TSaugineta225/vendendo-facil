import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, X } from "lucide-react";
import { useCustomerLookup } from "@/hooks/useCustomerLookup";

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onCustomerSelect: (customerId: string | undefined) => void;
}

export function CustomerSelector({ selectedCustomerId, onCustomerSelect }: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { customers, loading } = useCustomerLookup();

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId);
    setShowResults(false);
    setSearchTerm("");
  };

  const clearSelection = () => {
    onCustomerSelect(undefined);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      {selectedCustomer ? (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{selectedCustomer.name}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={clearSelection}
            className="ml-auto h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            onFocus={() => setShowResults(searchTerm.length > 0)}
            className="pl-10"
          />
          
          {showResults && (
            <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto">
              <CardContent className="p-2">
                {loading ? (
                  <div className="text-center p-2 text-sm text-muted-foreground">
                    Carregando...
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCustomers.map((customer) => (
                      <Button
                        key={customer.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => handleCustomerSelect(customer.id)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {customer.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-2 text-sm text-muted-foreground">
                    Nenhum cliente encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}