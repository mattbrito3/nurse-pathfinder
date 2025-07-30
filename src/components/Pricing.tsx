import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar seus estudos",
    icon: Star,
    features: [
      "Calculadora básica de medicação",
      "Acesso a 100 termos do glossário",
      "50 flashcards por mês",
      "Suporte por email",
      "Acesso por 7 dias"
    ],
    buttonText: "Começar Grátis",
    buttonVariant: "medical-outline" as const,
    popular: false
  },
  {
    name: "Estudante",
    price: "R$ 29",
    period: "/mês",
    description: "Ideal para estudantes de enfermagem",
    icon: Zap,
    features: [
      "Calculadora avançada de medicação",
      "Acesso completo ao glossário",
      "Flashcards ilimitados",
      "Suporte prioritário",
      "Acesso offline",
      "Histórico de progresso"
    ],
    buttonText: "Assinar Plano",
    buttonVariant: "medical" as const,
    popular: true
  },
  {
    name: "Profissional",
    price: "R$ 59",
    period: "/mês",
    description: "Para profissionais que buscam excelência",
    icon: Crown,
    features: [
      "Todas as funcionalidades do Estudante",
      "Calculadora com protocolos avançados",
      "Simulados personalizados",
      "Certificados de conclusão",
      "Suporte 24/7",
      "Acesso prioritário a novos conteúdos"
    ],
    buttonText: "Assinar Pro",
    buttonVariant: "medical" as const,
    popular: false
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanClick = (planName: string, buttonText: string) => {
    if (buttonText === "Começar Grátis") {
      if (!user) {
        navigate('/auth');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Redirect to pricing page for paid plans
      navigate('/pricing');
    }
  };

  return (
    <section id="planos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-foreground">
            Planos que se adaptam ao seu{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">ritmo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o plano ideal para sua jornada na enfermagem. 
            Todos os planos incluem acesso mobile e sincronização em nuvem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative group hover:shadow-card transition-all duration-300 hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-primary/70 shadow-card ring-2 ring-primary/30 bg-gradient-to-br from-card to-primary/5' 
                  : 'border-border/80 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary px-4 py-1 rounded-full text-white text-sm font-medium">
                    Mais Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full ${plan.popular ? 'bg-gradient-primary' : 'bg-muted'} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full py-6 text-lg ${plan.popular ? 'shadow-soft' : ''}`}
                  onClick={() => handlePlanClick(plan.name, plan.buttonText)}
                >
                  {plan.buttonText}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-muted-foreground">
            Todos os planos incluem garantia de 30 dias. 
            <a href="#" className="text-primary hover:underline ml-1">Saiba mais</a>
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <span>✓ Sem taxas de cancelamento</span>
            <span>✓ Atualizações gratuitas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;