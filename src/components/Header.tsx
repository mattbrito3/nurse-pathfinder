import { Button } from "@/components/ui/button";
import { Heart, Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">EnfermagemPro</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">
            Funcionalidades
          </a>
          <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </a>
          <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <User className="h-4 w-4 mr-2" />
            Entrar
          </Button>
          <Button variant="medical" size="sm">
            Começar Grátis
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;