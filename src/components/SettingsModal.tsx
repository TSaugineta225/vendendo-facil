import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function SettingsModal() {
  const { settings, updateSetting, loading } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    for (const [key, value] of Object.entries(localSettings)) {
      if (settings[key as keyof typeof settings] !== value) {
        await updateSetting(key as keyof typeof settings, value);
      }
    }
    setIsOpen(false);
  };

  const currencies = [
    { code: 'MZN', symbol: 'MT', name: 'Metical' },
    { code: 'USD', symbol: '$', name: 'Dólar Americano' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'ZAR', symbol: 'R', name: 'Rand Sul-Africano' }
  ];

  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Sistema</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select
              value={localSettings.currency}
              onValueChange={(value) => {
                const currency = currencies.find(c => c.code === value);
                setLocalSettings(prev => ({
                  ...prev,
                  currency: value,
                  currency_symbol: currency?.symbol || value
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select
              value={localSettings.language}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate">Taxa de Imposto (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              value={localSettings.tax_rate}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, tax_rate: e.target.value }))}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa</Label>
            <Input
              id="company_name"
              value={localSettings.company_name}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, company_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt_footer">Rodapé do Recibo</Label>
            <Input
              id="receipt_footer"
              value={localSettings.receipt_footer}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, receipt_footer: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}