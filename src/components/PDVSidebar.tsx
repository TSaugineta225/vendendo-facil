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
  const { state, toggleSidebar } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleToggle = () => {
    setCollapsed(!collapsed);
    toggleSidebar();
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-pdv-sidebar border-r border-border`}>
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-xl font-bold text-foreground">Vendendo Fácil</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="hover:bg-sidebar-accent"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Sistema de Vendas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-sidebar-accent text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}