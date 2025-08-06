import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
              <li><Link to="/dashboard/calculator" className="hover:text-foreground transition-colors">Calculadora de Medicação</Link></li>
              <li><Link to="/dashboard/glossary" className="hover:text-foreground transition-colors">Glossário Médico</Link></li>
              <li><Link to="/dashboard/flashcards" className="hover:text-foreground transition-colors">Flashcards</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Planos e Preços</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground transition-colors">Central de Ajuda</Link></li>
              <li><a href="mailto:mateusbritocontact@gmail.com" className="hover:text-foreground transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/legal/termos-de-uso" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
              <li><Link to="/legal/politica-de-privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-foreground transition-colors">Política de Cookies</Link></li>
              <li><Link to="/legal/assinatura" className="hover:text-foreground transition-colors">Termos de Assinatura</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-muted-foreground">
                                   <p>&copy; {currentYear} Dose Certa. Todos os direitos reservados.</p>
            </div>
            
            {/* Disclaimer médico */}
            <div className="text-xs text-muted-foreground text-center md:text-right max-w-md">
              ⚠️ Esta plataforma é exclusivamente educativa e não substitui consultas médicas profissionais.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
