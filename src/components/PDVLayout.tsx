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
          <header className="h-16 bg-pdv-header border-b border-border flex items-center px-6">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-semibold text-foreground">Sistema de Vendas</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}