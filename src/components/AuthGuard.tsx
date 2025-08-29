import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { AuthModal } from './AuthModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'cashier' | 'viewer';
  allowRoles?: ('admin' | 'cashier' | 'viewer')[];
}

export function AuthGuard({ children, requiredRole, allowRoles }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading, hasRole, isAdmin, isCashier } = useProfiles();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [authLoading, user]);

  // Show loading while checking authentication
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Você precisa fazer login para acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
        />
      </>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página. É necessário ter o papel de{' '}
              <strong>{requiredRole}</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check allowed roles
  if (allowRoles && !allowRoles.some(role => hasRole(role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página. É necessário ter um dos seguintes papéis:{' '}
              <strong>{allowRoles.join(', ')}</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}