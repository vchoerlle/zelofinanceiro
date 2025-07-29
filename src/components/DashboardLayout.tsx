import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Tag,
  PieChart,
  Target,
  Users,
  Bot,
  ShoppingCart,
  Car,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: TrendingUp, label: "Receitas", path: "/receitas" },
    { icon: TrendingDown, label: "Despesas", path: "/despesas" },
    { icon: FileText, label: "Transações", path: "/transacoes" },
    { icon: PieChart, label: "Parcelamentos", path: "/dividas" },
    { icon: Tag, label: "Categorias", path: "/categorias" },
    { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
    { icon: Target, label: "Metas", path: "/metas" },
    { icon: ShoppingCart, label: "Mercado", path: "/mercado" },
    { icon: Car, label: "Veículos", path: "/veiculos" },
    { icon: Users, label: "Perfil", path: "/perfil" },
    { icon: Bot, label: "IA", path: "/ia" },
  ];

  const handleLogout = () => {
    // Limpar dados de autenticação do localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("isAuthenticated");

    // Mostrar toast de confirmação
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });

    // Redirecionar para a página inicial (login)
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Mobile Menu Button - Only show when menu is closed */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-background shadow-md rounded-full hover:bg-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          transition-all duration-300
          bg-background border-r border-border flex flex-col
          z-40
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Logo */}
        <div className="py-0 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCollapsed ? (
                <img 
                  src="/logo-icon.png" 
                  alt="Zelo Financeiro Icon" 
                  className="h-8 w-8 transition-all duration-300"
                />
              ) : (
                <img 
                  src="/logo-full.png" 
                  alt="Zelo Financeiro Logo" 
                  className="h-48 w-auto transition-all duration-300"
                />
              )}
            </div>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 hover:bg-accent transition-colors"
              onClick={closeMobileMenu}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Collapse Button - Positioned on the edge - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
                      className={`
            hidden lg:flex absolute top-6 -right-3
            h-6 w-6 rounded-full bg-background border border-border
            hover:bg-accent hover:border-border
            transition-all duration-200 shadow-sm
            items-center justify-center
          `}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-orange-100 text-orange-600"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Theme Toggle and Logout */}
        <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"}`}>
            <ThemeToggle 
              className={isCollapsed ? "w-full justify-center" : ""}
            />
            {!isCollapsed && <span className="ml-3 text-sm text-muted-foreground">Tema</span>}
          </div>
          
          <Button
            variant="ghost"
            className={`w-full text-muted-foreground hover:text-foreground ${
              isCollapsed ? "justify-center px-0" : "justify-start"
            }`}
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        } transition-all duration-300`}
      >
        <div className="lg:hidden h-16"></div>{" "}
        {/* Spacer for mobile menu button */}
        {children}
      </div>
    </div>
  );
};
