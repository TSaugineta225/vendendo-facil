import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Setting {
  key: string;
  value: string;
  description?: string;
}

interface AppSettings {
  currency: string;
  currency_symbol: string;
  language: string;
  tax_rate: string;
  company_name: string;
  receipt_footer: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'MZN',
    currency_symbol: 'MT',
    language: 'pt',
    tax_rate: '17',
    company_name: 'Minha Empresa',
    receipt_footer: 'Obrigado pela sua preferência!'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key as keyof AppSettings] = setting.value;
        return acc;
      }, {} as Partial<AppSettings>) || {};

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Configuração atualizada');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings
  };
}