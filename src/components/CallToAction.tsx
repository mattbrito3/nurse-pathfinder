import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.4) 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, hsl(var(--secondary) / 0.4) 0%, transparent 50%)`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 
              className="text-3xl lg:text-5xl font-bold text-foreground"
              data-aos="fade-up"
            >
              Pronto para transformar seus{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent gradient-text-animate">
                estudos?
              </span>
            </h2>
            <p 
              className="text-xl text-muted-foreground leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Junte-se a centenas de estudantes e profissionais que já estão 
              usando o Dose Certa para acelerar sua carreira na enfermagem.
            </p>
          </div>

          <div 
            className="flex justify-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Button 
              variant="medical" 
              size="lg" 
              className="text-lg px-8 py-6 shadow-hero hover-lift btn-pulse"
            >
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="flex items-center gap-2 hover-scale">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 fill-secondary text-secondary hover-scale"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">4.9/5 de satisfação</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div className="text-muted-foreground hover-scale">
              ✓ Sem compromisso • ✓ Cancele quando quiser
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-primary rounded-full opacity-30 float" />
      <div className="absolute bottom-10 right-10 w-6 h-6 bg-secondary rounded-full opacity-30 float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-5 w-3 h-3 bg-primary rounded-full opacity-20 float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-8 w-5 h-5 bg-secondary rounded-full opacity-25 float" style={{ animationDelay: '1.5s' }} />
    </section>
  );
};

export default CallToAction;
