import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X } from 'lucide-react';
import { useSalesHistory } from '@/hooks/useSalesHistory';
import { useSettings } from '@/hooks/useSettings';

interface ReceiptModalProps {
  saleId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Sale {
  id: string;
  customer_id?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  created_at: string;
  notes?: string;
  sale_items?: {
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    total_price: number;
    products?: {
      name: string;
      category: string;
    };
  }[];
  customers?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export function ReceiptModal({ saleId, isOpen, onClose }: ReceiptModalProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const { getSaleById } = useSalesHistory();
  const { settings } = useSettings();

  useEffect(() => {
    if (saleId && isOpen) {
      loadSale();
    }
  }, [saleId, isOpen]);

  const loadSale = async () => {
    setLoading(true);
    const saleData = await getSaleById(saleId);
    setSale(saleData);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return `${settings.currency_symbol} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    // Create a simple text receipt for download
    if (!sale) return;
    
    let receiptText = `${settings.company_name}\n`;
    receiptText += `================================\n`;
    receiptText += `RECIBO DE VENDA\n`;
    receiptText += `================================\n`;
    receiptText += `Venda #: ${sale.id.slice(-8)}\n`;
    receiptText += `Data: ${formatDate(sale.created_at)}\n`;
    
    if (sale.customers) {
      receiptText += `Cliente: ${sale.customers.name}\n`;
    }
    
    receiptText += `Pagamento: ${sale.payment_method.toUpperCase()}\n`;
    receiptText += `================================\n`;
    
    sale.sale_items?.forEach((item, index) => {
      receiptText += `${index + 1}. ${item.products?.name || 'Produto'}\n`;
      receiptText += `   ${item.quantity}x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}\n`;
    });
    
    receiptText += `================================\n`;
    receiptText += `Subtotal: ${formatCurrency(sale.total_amount - sale.tax_amount + sale.discount_amount)}\n`;
    
    if (sale.discount_amount > 0) {
      receiptText += `Desconto: -${formatCurrency(sale.discount_amount)}\n`;
    }
    
    if (sale.tax_amount > 0) {
      receiptText += `IVA (${settings.tax_rate}%): ${formatCurrency(sale.tax_amount)}\n`;
    }
    
    receiptText += `TOTAL: ${formatCurrency(sale.total_amount)}\n`;
    receiptText += `================================\n`;
    receiptText += `${settings.receipt_footer}\n`;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${sale.id.slice(-8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pdv-button"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!sale) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="text-center text-muted-foreground py-8">
            Venda não encontrada
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Recibo de Venda</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div id="receipt-content" className="space-y-4 font-mono text-sm">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold">{settings.company_name}</h2>
            <div className="text-xs text-muted-foreground">RECIBO DE VENDA</div>
          </div>

          <Separator />

          {/* Sale Info */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Venda #:</span>
              <span className="font-bold">#{sale.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Data:</span>
              <span>{formatDate(sale.created_at)}</span>
            </div>
            {sale.customers && (
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{sale.customers.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pagamento:</span>
              <Badge className="text-xs">
                {sale.payment_method.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            {sale.sale_items?.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="font-medium">
                  {index + 1}. {item.products?.name || 'Produto'}
                </div>
                <div className="flex justify-between text-xs">
                  <span>{item.quantity}x {formatCurrency(item.unit_price)}</span>
                  <span className="font-bold">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
                {item.discount_percentage > 0 && (
                  <div className="text-xs text-pdv-success">
                    Desconto: {item.discount_percentage}%
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {formatCurrency(sale.total_amount - sale.tax_amount + sale.discount_amount)}
              </span>
            </div>
            
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-pdv-success">
                <span>Desconto:</span>
                <span>-{formatCurrency(sale.discount_amount)}</span>
              </div>
            )}
            
            {sale.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>IVA ({settings.tax_rate}%):</span>
                <span>{formatCurrency(sale.tax_amount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>

          {sale.notes && (
            <>
              <Separator />
              <div className="text-xs">
                <div className="font-medium">Observações:</div>
                <div className="italic">{sale.notes}</div>
              </div>
            </>
          )}

          <Separator />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            {settings.receipt_footer}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handlePrint} 
            className="flex-1 bg-pdv-button hover:bg-pdv-button/90"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}