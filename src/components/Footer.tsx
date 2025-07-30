import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Dose Certa</h3>
            </div>
            <p className="text-muted-foreground">
              Capacitando estudantes e profissionais de enfermagem com ferramentas 
              modernas e conteúdo de qualidade.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Calculadora de Medicação</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Glossário Médico</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Flashcards</a></li>
              
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>mateusbritocontact@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 91988-6846</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Dose Certa. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;