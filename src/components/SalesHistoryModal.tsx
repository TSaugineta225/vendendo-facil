import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CalendarDays, User, CreditCard, Clock, Receipt } from 'lucide-react';
import { useSalesHistory } from '@/hooks/useSalesHistory';
import { useSettings } from '@/hooks/useSettings';
import { ReceiptModal } from './ReceiptModal';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SalesHistoryModal({ isOpen, onClose }: SalesHistoryModalProps) {
  const { sales, loading, fetchSales, getSalesStats } = useSalesHistory();
  const { settings } = useSettings();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const stats = getSalesStats();

  const handleSearch = () => {
    fetchSales(startDate, endDate);
  };

  const formatCurrency = (amount: number) => {
    return `${settings.currency_symbol} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      dinheiro: 'bg-green-100 text-green-800',
      visa: 'bg-blue-100 text-blue-800',
      mpesa: 'bg-red-100 text-red-800',
      mmola: 'bg-purple-100 text-purple-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Histórico de Vendas
            </DialogTitle>
          </DialogHeader>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-pdv-success/10 to-pdv-button/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pdv-button">{stats.totalSales}</div>
              <div className="text-sm text-muted-foreground">Vendas Hoje</div>
            </div>
            <div className="bg-gradient-to-r from-pdv-button/10 to-pdv-accent/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pdv-button">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Hoje</div>
            </div>
            <div className="bg-gradient-to-r from-pdv-accent/10 to-pdv-success/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pdv-button">
                {formatCurrency(stats.avgSale)}
              </div>
              <div className="text-sm text-muted-foreground">Venda Média</div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <Label htmlFor="start-date">Data Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Data Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-pdv-button hover:bg-pdv-button/90"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>

          <Separator />

          {/* Sales List */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pdv-button"></div>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma venda encontrada para o período selecionado
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSaleId(sale.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-pdv-button" />
                        <span className="font-medium">#{sale.id.slice(-8)}</span>
                        {sale.customers && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {sale.customers.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-pdv-button">
                          {formatCurrency(sale.total_amount)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(sale.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentMethodBadge(sale.payment_method)}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {sale.payment_method.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {sale.sale_items?.length || 0} itens
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {sale.payment_status}
                      </div>
                    </div>

                    {sale.notes && (
                      <div className="mt-2 text-sm text-muted-foreground italic">
                        "{sale.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {selectedSaleId && (
        <ReceiptModal
          saleId={selectedSaleId}
          isOpen={!!selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
        />
      )}
    </>
  );
}