import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'cashier' | 'viewer';
  created_at: string;
}

export function useProfiles() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const hasRole = (role: 'admin' | 'cashier' | 'viewer'): boolean => {
    return userRoles.some(userRole => userRole.role === role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isCashier = (): boolean => hasRole('cashier');
  const canManageProducts = (): boolean => isAdmin() || isCashier();
  const canProcessSales = (): boolean => isAdmin() || isCashier();

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    userRoles,
    loading,
    updateProfile,
    hasRole,
    isAdmin,
    isCashier,
    canManageProducts,
    canProcessSales,
    refetch: fetchProfile
  };
}