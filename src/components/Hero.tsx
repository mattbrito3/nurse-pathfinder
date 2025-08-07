import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/nursing-hero.jpg";
import { useParallax } from "@/hooks/useScrollAnimations";

const Hero = () => {
  const parallaxOffset = useParallax(0.3);

  return (
    <section className="py-12 sm:py-16 lg:py-32 bg-gradient-hero parallax-container overflow-hidden">
      {/* Parallax Background Elements */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, hsl(var(--secondary) / 0.3) 0%, transparent 50%)`,
          transform: `translateY(${parallaxOffset * 0.5}px)`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight text-foreground hero-title"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Sua jornada na{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent gradient-text-animate">
                  enfermagem
                </span>{" "}
                começa aqui
              </h1>
              <p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed hero-subtitle"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Ferramenta completa de estudo e referência para estudantes e profissionais 
                de enfermagem. Calculadora de medicação, glossário médico e flashcards 
                interativos em uma plataforma moderna e intuitiva.
              </p>
            </div>

            <div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Button 
                variant="medical" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-hero hover-lift btn-pulse"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="medical-outline" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover-glow"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Ver Demonstração
              </Button>
            </div>

            <div 
              className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 pt-4 stats-grid"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="text-center hover-scale stats-item">
                <div className="text-xl sm:text-2xl font-bold text-foreground stats-number">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground stats-label">Estudantes</div>
              </div>
              <div className="text-center hover-scale stats-item">
                <div className="text-xl sm:text-2xl font-bold text-foreground stats-number">1000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground stats-label">Termos Médicos</div>
              </div>
              <div className="text-center hover-scale stats-item">
                <div className="text-xl sm:text-2xl font-bold text-foreground stats-number">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground stats-label">Acesso</div>
              </div>
            </div>
          </div>

          <div 
            className="relative order-first lg:order-last"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div 
              className="absolute inset-0 bg-gradient-primary rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-20 float"
              style={{
                transform: `translateY(${parallaxOffset * 0.3}px)`
              }}
            />
            <img 
              src={heroImage} 
              alt="Estudantes de enfermagem estudando"
              className="relative z-10 w-full h-auto rounded-2xl sm:rounded-3xl shadow-hero hover-lift"
              style={{
                transform: `translateY(${parallaxOffset * 0.2}px)`
              }}
            />
            
            {/* Floating decorative elements */}
            <div 
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full opacity-60 float"
              style={{ animationDelay: '1s' }}
            />
            <div 
              className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-secondary rounded-full opacity-60 float"
              style={{ animationDelay: '2s' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
