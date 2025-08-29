import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { useSalesHistory } from "@/hooks/useSalesHistory";
import { toast } from "sonner";

const mockSalesData = {
  daily: {
    totalSales: 1250.50,
    totalOrders: 45,
    totalProducts: 120,
    topSeller: "João Silva",
    change: 8.5
  },
  weekly: {
    totalSales: 8750.20,
    totalOrders: 315,
    totalProducts: 840,
    topSeller: "Maria Santos",
    change: 12.3
  },
  monthly: {
    totalSales: 35500.80,
    totalOrders: 1260,
    totalProducts: 3360,
    topSeller: "Carlos Lima",
    change: -2.1
  }
};

const mockTopProducts = [
  { name: "Coca-Cola 350ml", quantity: 45, revenue: 112.50 },
  { name: "Pão Francês", quantity: 120, revenue: 60.00 },
  { name: "Leite Integral 1L", quantity: 25, revenue: 105.00 },
  { name: "Arroz 5kg", quantity: 8, revenue: 207.20 },
  { name: "Feijão Preto 1kg", quantity: 12, revenue: 102.00 }
];

const mockRecentSales = [
  { id: "001", customer: "Cliente A", total: 45.80, payment: "Dinheiro", time: "14:30" },
  { id: "002", customer: "Cliente B", total: 125.50, payment: "Visa", time: "14:25" },
  { id: "003", customer: "Cliente C", total: 35.20, payment: "M-Pesa", time: "14:20" },
  { id: "004", customer: "Cliente D", total: 89.90, payment: "M-Mola", time: "14:15" },
  { id: "005", customer: "Cliente E", total: 67.30, payment: "Dinheiro", time: "14:10" }
];

const paymentMethodColors = {
  "Dinheiro": "success",
  "Visa": "default",
  "M-Pesa": "secondary",
  "M-Mola": "warning"
} as const;

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const { sales, loading, getSalesStats } = useSalesHistory();
  const [salesStats, setSalesStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getSalesStats();
        setSalesStats(stats);
      } catch (error) {
        console.error('Error fetching sales stats:', error);
        toast.error('Erro ao carregar estatísticas');
      }
    };

    fetchStats();
  }, [getSalesStats]);

  const currentData = salesStats || {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    topSeller: "N/A",
    change: 0
  };
  const isPositiveChange = currentData.change > 0;

  const periodLabels = {
    daily: "Hoje",
    weekly: "Esta Semana", 
    monthly: "Este Mês"
  };

  const handleExportReport = () => {
    // Aqui você implementaria a exportação do relatório
    console.log("Exportando relatório...");
  };

  return (
    <AuthGuard allowRoles={['admin', 'cashier']}>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios de Vendas</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={(value: "daily" | "weekly" | "monthly") => setSelectedPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Relatório Diário</SelectItem>
              <SelectItem value="weekly">Relatório Semanal</SelectItem>
              <SelectItem value="monthly">Relatório Mensal</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendas Totais</p>
                <p className="text-2xl font-bold">MT {currentData.totalSales.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className={`text-sm ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(currentData.change)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">vs período anterior</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{currentData.totalOrders}</p>
                <p className="text-sm text-muted-foreground">
                  Média: MT {currentData.totalOrders > 0 ? (currentData.totalSales / currentData.totalOrders).toFixed(2) : '0.00'} por pedido
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos Vendidos</p>
                <p className="text-2xl font-bold">{currentData.totalProducts}</p>
                <p className="text-sm text-muted-foreground">
                  {periodLabels[selectedPeriod]}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Melhor Vendedor</p>
                <p className="text-lg font-bold">{currentData.topSeller}</p>
                <p className="text-sm text-muted-foreground">
                  {periodLabels[selectedPeriod]}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTopProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>MT {product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.customer}</TableCell>
                    <TableCell>MT {sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={paymentMethodColors[sale.payment as keyof typeof paymentMethodColors]}>
                        {sale.payment}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Método de Pagamento - {periodLabels[selectedPeriod]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-success">MT 450.80</p>
              <p className="text-sm text-muted-foreground">Dinheiro</p>
              <Badge variant="success" className="mt-1">36%</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">MT 320.50</p>
              <p className="text-sm text-muted-foreground">Visa</p>
              <Badge variant="default" className="mt-1">26%</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-secondary">MT 290.20</p>
              <p className="text-sm text-muted-foreground">M-Pesa</p>
              <Badge variant="secondary" className="mt-1">23%</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-warning">MT 189.00</p>
              <p className="text-sm text-muted-foreground">M-Mola</p>
              <Badge variant="warning" className="mt-1">15%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  );
}