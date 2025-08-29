import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Eye, Phone, Mail, MapPin, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchase: string;
  status: "active" | "inactive";
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "+258 84 123 4567",
    address: "Maputo, Moçambique",
    totalPurchases: 1250.75,
    lastPurchase: "2024-01-15",
    status: "active"
  },
  {
    id: "2", 
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+258 87 987 6543",
    address: "Beira, Moçambique",
    totalPurchases: 875.50,
    lastPurchase: "2024-01-12",
    status: "active"
  },
  {
    id: "3",
    name: "Carlos Lima", 
    email: "carlos@email.com",
    phone: "+258 82 456 7890",
    address: "Nampula, Moçambique",
    totalPurchases: 2100.25,
    lastPurchase: "2024-01-10",
    status: "active"
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@email.com", 
    phone: "+258 85 321 9876",
    address: "Matola, Moçambique",
    totalPurchases: 450.00,
    lastPurchase: "2023-12-20",
    status: "inactive"
  }
];

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to component expected format
      const mappedCustomers = data?.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        totalPurchases: 0, // Will be calculated from sales
        lastPurchase: new Date().toISOString().split('T')[0],
        status: 'active' as const
      })) || [];
      
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
    setShowDialog(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address
          })
          .eq('id', selectedCustomer.id);

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('customers')
          .insert({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address
          });

        if (error) throw error;
        toast.success("Cliente adicionado com sucesso!");
      }
      setShowDialog(false);
      await fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error("Erro ao salvar cliente");
    }
  };

  return (
    <AuthGuard allowRoles={['admin', 'cashier']}>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        <Button onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-success/10 rounded-full">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{activeCustomers}</p>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pesquisar clientes por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Total de Compras</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {customer.address}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </p>
                      <p className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${customer.totalPurchases.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.lastPurchase).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "success" : "secondary"}>
                      {customer.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing 
                ? (selectedCustomer ? "Editar Cliente" : "Adicionar Cliente")
                : "Detalhes do Cliente"
              }
            </DialogTitle>
          </DialogHeader>
          
          {isEditing ? (
            <CustomerForm
              customer={selectedCustomer}
              onSave={handleSaveCustomer}
              onCancel={() => setShowDialog(false)}
            />
          ) : (
            selectedCustomer && <CustomerDetails customer={selectedCustomer} />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AuthGuard>
  );
}

function CustomerDetails({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome</Label>
          <p className="text-lg font-medium">{customer.name}</p>
        </div>
        <div>
          <Label>Status</Label>
          <div className="mt-1">
            <Badge variant={customer.status === "active" ? "success" : "secondary"}>
              {customer.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <p>{customer.email}</p>
        </div>
        <div>
          <Label>Telefone</Label>
          <p>{customer.phone}</p>
        </div>
      </div>

      <div>
        <Label>Endereço</Label>
        <p>{customer.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Total de Compras</Label>
          <p className="text-lg font-bold text-primary">${customer.totalPurchases.toFixed(2)}</p>
        </div>
        <div>
          <Label>Última Compra</Label>
          <p>{new Date(customer.lastPurchase).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}

function CustomerForm({ 
  customer, 
  onSave, 
  onCancel 
}: { 
  customer: Customer | null; 
  onSave: (data: Partial<Customer>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    status: customer?.status || "active" as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {customer ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}