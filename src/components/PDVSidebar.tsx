import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  FileText,
  Receipt,
  DollarSign,
  Package,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "PDV", url: "/", icon: ShoppingCart },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Facturas", url: "/facturas", icon: FileText },
  { title: "Recibos", url: "/recibos", icon: Receipt },
  { title: "Pagamentos", url: "/pagamentos", icon: CreditCard },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function PDVSidebar() {
  const { state, toggleSidebar, open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="transition-all duration-300 bg-pdv-sidebar border-r border-border" collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {open && (
              <h2 className="text-xl font-bold text-foreground bg-gradient-to-r from-pdv-success to-pdv-button bg-clip-text text-transparent">
                💰 Vendendo Fácil
              </h2>
            )}
            {!open && (
              <div className="w-8 h-8 bg-gradient-to-r from-pdv-success to-pdv-button rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Sistema de Vendas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-pdv-success to-pdv-button text-white shadow-lg scale-105"
                            : "hover:bg-pdv-accent text-sidebar-foreground hover:scale-105 hover:shadow-md"
                        }`
                      }
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.url) ? 'text-white' : 'text-muted-foreground'}`} />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions - only show when expanded */}
        {open && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-pdv-success to-pdv-button hover:shadow-lg transition-all"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-pdv-button/20 hover:bg-pdv-accent"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatório Rápido
              </Button>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}