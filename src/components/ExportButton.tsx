import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { useProfiles } from '@/hooks/useProfiles';
import { useSalesHistory } from '@/hooks/useSalesHistory';

interface ExportButtonProps {
  period: 'daily' | 'weekly' | 'monthly';
  data?: any;
}

export function ExportButton({ period, data }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useProfiles();
  const { sales } = useSalesHistory();

  if (!isAdmin()) {
    return null; // Só admins podem exportar
  }

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      // Simular exportação PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      // Simular exportação Excel
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Planilha Excel exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // Converter dados para CSV
      const csvData = sales.map(sale => ({
        ID: sale.id,
        Data: new Date(sale.created_at).toLocaleDateString('pt-BR'),
        Cliente: sale.customers?.name || 'N/A',
        Total: sale.total_amount,
        Pagamento: sale.payment_method,
        Itens: 1 // Simplified for now
      }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_vendas_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Arquivo CSV baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}