import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/nursing-hero.jpg";

const Hero = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
                Sua jornada na{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  enfermagem
                </span>{" "}
                começa aqui
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Ferramenta completa de estudo e referência para estudantes e profissionais 
                de enfermagem. Calculadora de medicação, glossário médico e flashcards 
                interativos em uma plataforma moderna e intuitiva.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="medical" 
                size="lg" 
                className="text-lg px-8 py-6 shadow-hero"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="medical-outline" 
                size="lg" 
                className="text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Estudantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Termos Médicos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Acesso</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
            <img 
              src={heroImage} 
              alt="Estudantes de enfermagem estudando"
              className="relative z-10 w-full h-auto rounded-3xl shadow-hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;