import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Pronto para transformar seus{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                estudos?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Junte-se a centenas de estudantes e profissionais que já estão 
              usando o Dose Certa para acelerar sua carreira na enfermagem.
            </p>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="medical" 
              size="lg" 
              className="text-lg px-8 py-6 shadow-hero"
            >
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                ))}
              </div>
              <span className="text-muted-foreground">4.9/5 de satisfação</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div className="text-muted-foreground">
              ✓ Sem compromisso • ✓ Cancele quando quiser
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
