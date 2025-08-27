import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  History, 
  User, 
  TrendingUp, 
  Clock,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { SalesHistoryModal } from './SalesHistoryModal';
import { useSalesHistory } from '@/hooks/useSalesHistory';

interface PDVHeaderProps {
  currencySymbol: string;
  currency: string;
  companyName: string;
  cartCount: number;
  cartTotal: number;
}

export function PDVHeader({ 
  currencySymbol, 
  currency, 
  companyName,
  cartCount,
  cartTotal
}: PDVHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { getSalesStats } = useSalesHistory();
  
  const stats = getSalesStats();
  const currentTime = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <>
      <div className="bg-gradient-to-r from-pdv-button to-pdv-accent text-white p-4 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left Side - Company Info */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{companyName}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Clock className="h-4 w-4" />
                <span>Sessão ativa - {currentTime}</span>
              </div>
            </div>
            
            <div className="h-12 w-px bg-white/20"></div>
            
            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold">{stats.totalSales}</div>
                <div className="text-xs opacity-75">Vendas Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {currencySymbol} {stats.totalRevenue.toFixed(0)}
                </div>
                <div className="text-xs opacity-75">Receita</div>
              </div>
            </div>
          </div>

          {/* Center - Current Order */}
          <div className="flex items-center gap-4 bg-white/10 rounded-lg p-3">
            <ShoppingCart className="h-6 w-6" />
            <div className="text-center">
              <div className="text-lg font-bold">
                {cartCount > 0 ? `${cartCount} itens` : 'Carrinho vazio'}
              </div>
              {cartCount > 0 && (
                <div className="text-sm opacity-90">
                  {currencySymbol} {cartTotal.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              {currencySymbol} {currency}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="text-white hover:bg-white/20 gap-2"
            >
              <History className="h-4 w-4" />
              Histórico
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/20 gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Bottom Row - Quick Actions */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 opacity-75">
              <span>💡 Dica: Use Ctrl+F para buscar produtos rapidamente</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Média por venda: {currencySymbol} {stats.avgSale.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Operador: Sistema</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal />
      
      <SalesHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}