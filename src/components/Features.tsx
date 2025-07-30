import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, Brain, FileText, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Calculadora de Medicação",
    description: "Cálculos precisos de dosagem com guia passo a passo para evitar erros de medicação.",
    color: "text-primary",
    bgColor: "bg-medical-light-blue"
  },
  {
    icon: BookOpen,
    title: "Glossário Médico",
    description: "Mais de 1000 termos médicos com definições claras preparadas por profissionais experientes.",
    color: "text-secondary",
    bgColor: "bg-medical-light-green"
  },
  {
    icon: Brain,
    title: "Flashcards Interativos",
    description: "Sistema de revisão inteligente que se adapta ao seu progresso de aprendizado.",
    color: "text-primary",
    bgColor: "bg-medical-light-blue"
  },
  {
    icon: Shield,
    title: "Conteúdo Confiável",
    description: "Todo conteúdo revisado por enfermeiros especialistas e atualizado regularmente.",
    color: "text-primary",
    bgColor: "bg-medical-light-blue"
  },
  {
    icon: Smartphone,
    title: "Acesso Offline",
    description: "Sincronização de dados para acesso sem conexão em qualquer lugar.",
    color: "text-secondary",
    bgColor: "bg-medical-light-green"
  }
];

const Features = () => {
  return (
    <section id="funcionalidades" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-foreground">
            Funcionalidades
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Completas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todas as ferramentas que você precisa para se destacar na enfermagem, 
            reunidas em uma plataforma moderna e intuitiva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/80 shadow-sm"
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="medical" size="lg" className="px-8 py-6 text-lg">
            Explorar Todas as Funcionalidades
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;