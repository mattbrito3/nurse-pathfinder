import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Clock, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  {
    icon: Users,
    value: 500,
    label: "Estudantes Ativos",
    description: "Confiam na nossa plataforma"
  },
  {
    icon: Award,
    value: 98,
    label: "Taxa de Aprovação",
    description: "Dos nossos usuários em concursos"
  },
  {
    icon: Clock,
    value: 24,
    label: "Disponibilidade",
    description: "Acesso quando você precisar"
  },
  {
    icon: Smartphone,
    value: 100,
    label: "Mobile Friendly",
    description: "Funciona em qualquer dispositivo"
  }
];

const About = () => {
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('about-stats');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      const newValues = stats.map((stat, index) => {
        const targetValue = stat.value;
        const currentValue = Math.floor(targetValue * progress);
        return currentValue;
      });

      setAnimatedValues(newValues);

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(stats.map(stat => stat.value));
      }
    }, stepDuration);
  };

  return (
    <section id="sobre" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 
                className="text-3xl lg:text-5xl font-bold text-foreground"
                data-aos="fade-right"
              >
                Desenvolvido por{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent gradient-text-animate">
                  enfermeiros
                </span>{" "}
                para enfermeiros
              </h2>
              <p 
                className="text-xl text-muted-foreground leading-relaxed"
                data-aos="fade-right"
                data-aos-delay="100"
              >
                Nossa equipe de enfermeiros especialistas desenvolveu cada funcionalidade 
                pensando nas necessidades reais dos profissionais e estudantes da área.
              </p>
            </div>

            <div className="space-y-4">
              <div 
                className="flex items-start gap-4"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-3 hover-scale"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Conteúdo Validado</h3>
                  <p className="text-muted-foreground">
                    Todo material é revisado por enfermeiros com especialização e experiência clínica.
                  </p>
                </div>
              </div>
              <div 
                className="flex items-start gap-4"
                data-aos="fade-right"
                data-aos-delay="300"
              >
                <div className="w-2 h-2 bg-secondary rounded-full mt-3 hover-scale"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Sempre Atualizado</h3>
                  <p className="text-muted-foreground">
                    Acompanhamos as mudanças nas diretrizes e protocolos para manter você sempre informado.
                  </p>
                </div>
              </div>
              <div 
                className="flex items-start gap-4"
                data-aos="fade-right"
                data-aos-delay="400"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-3 hover-scale"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Foco na Prática</h3>
                  <p className="text-muted-foreground">
                    Ferramentas práticas que você pode usar no dia a dia da profissão.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              variant="medical" 
              size="lg" 
              className="px-8 py-6 text-lg hover-lift btn-pulse"
              data-aos="fade-right"
              data-aos-delay="500"
            >
              Conheça Nossa Equipe
            </Button>
          </div>

          <div 
            id="about-stats"
            className="grid grid-cols-2 gap-6"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/80 shadow-sm hover-lift"
                data-aos="fade-up"
                data-aos-delay={300 + (index * 100)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 hover-scale">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {animatedValues[index]}{stat.label === "Taxa de Aprovação" || stat.label === "Mobile Friendly" ? "%" : stat.label === "Disponibilidade" ? "/7" : "+"}
                    </div>
                    <div className="font-semibold text-foreground mt-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground mt-2">{stat.description}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
