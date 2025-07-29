
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 rounded-lg p-2">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Zelo Financeiro</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#recursos" className="text-muted-foreground hover:text-orange-500 transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-muted-foreground hover:text-orange-500 transition-colors">
              Como Funciona
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-orange-500 transition-colors">
              Preços
            </a>
            <a href="#contato" className="text-muted-foreground hover:text-orange-500 transition-colors">
              Contato
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline">
                Fazer Login
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Começar Grátis
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              <a href="#recursos" className="text-muted-foreground hover:text-orange-500 transition-colors">
                Recursos
              </a>
              <a href="#como-funciona" className="text-muted-foreground hover:text-orange-500 transition-colors">
                Como Funciona
              </a>
              <a href="#precos" className="text-muted-foreground hover:text-orange-500 transition-colors">
                Preços
              </a>
              <a href="#contato" className="text-muted-foreground hover:text-orange-500 transition-colors">
                Contato
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Fazer Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
