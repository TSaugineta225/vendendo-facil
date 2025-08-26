import { SidebarProvider } from "@/components/ui/sidebar";
import { PDVSidebar } from "./PDVSidebar";

interface PDVLayoutProps {
  children: React.ReactNode;
}

export function PDVLayout({ children }: PDVLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PDVSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-gradient-to-r from-pdv-header to-background border-b border-border flex items-center px-6 shadow-sm">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-foreground">Sistema de Vendas</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pdv-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'short', 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-pdv-light/30">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}