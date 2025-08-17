import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import UnifiedPaymentButton from "@/components/payment/UnifiedPaymentButton";
import { useEffect } from "react";

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
      "Direito a 7 usos diários na calculadora de medicação"
    ],
    buttonText: "Começar Grátis",
    buttonVariant: "medical-outline" as const,
    popular: false
  },
  // 🧪 PLANO DE TESTE - sempre mostrar temporariamente
  {
    name: "Teste",
    price: "R$ 0,01",
    period: "/teste",
    description: "Plano de teste para desenvolvimento",
    icon: Crown,
    features: [
      "Funcionalidades de teste",
      "Apenas para debugging",
      "Valor simbólico R$ 0,01"
    ],
    buttonText: "Testar (R$ 0,01)",
    buttonVariant: "destructive" as const,
    popular: false
  },
  {
    name: "Estudante",
    price: "R$ 18,99",
    period: "/mês",
    description: "Ideal para estudantes de enfermagem",
    icon: Zap,
    features: [
      "Calculadora avançada de medicação",
      "Acesso completo ao glossário",
      "Flashcards ilimitados",
      "Acesso offline",
      "Histórico de progresso"
    ],
    buttonText: "Assinar Plano",
    buttonVariant: "medical" as const,
    popular: true
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Handle payment return parameters
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const subscriptionStatus = searchParams.get('subscription');
    
    if (paymentStatus) {
      switch (paymentStatus) {
        case 'success':
          toast.success('Pagamento realizado com sucesso!', {
            description: 'Seu plano foi ativado. Bem-vindo ao DoseCerta!'
          });
          break;
        case 'failure':
          toast.error('Pagamento não foi concluído', {
            description: 'Houve um problema com o pagamento. Tente novamente.'
          });
          break;
        case 'pending':
          toast.info('Pagamento em processamento', {
            description: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.'
          });
          break;
      }
    }

    if (subscriptionStatus === 'success') {
      toast.success('Assinatura ativada com sucesso!', {
        description: 'Sua assinatura mensal foi configurada.'
      });
    }
  }, [searchParams]);

  const handlePlanClick = (planName: string, buttonText: string) => {
    if (buttonText === "Começar Grátis") {
      if (!user) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
    }
    // For paid plans, the UnifiedPaymentButton will handle the payment
  };

  return (
    <section id="planos" className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 
            className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 text-foreground"
            data-aos="fade-up"
          >
            Planos que se adaptam ao seu{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent gradient-text-animate">ritmo</span>
          </h2>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Escolha o plano ideal para sua jornada na enfermagem. 
            Todos os planos incluem acesso mobile e sincronização em nuvem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative group hover:shadow-card transition-all duration-300 hover:-translate-y-1 hover-lift ${
                plan.popular 
                  ? 'border-primary/70 shadow-card ring-2 ring-primary/30 bg-gradient-to-br from-card to-primary/5' 
                  : 'border-border/80 shadow-sm'
              }`}
              data-aos="fade-up"
              data-aos-delay={200 + (index * 200)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary px-4 py-1 rounded-full text-white text-sm font-medium hover-scale">
                    Mais Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4 md:pb-6">
                <div className={`w-16 h-16 rounded-full ${plan.popular ? 'bg-gradient-primary' : 'bg-muted'} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 hover-scale`}>
                  <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-start gap-3"
                      data-aos="fade-up"
                      data-aos-delay={400 + (index * 200) + (featureIndex * 50)}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 hover-scale">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {plan.buttonText === "Assinar Plano" ? (
                    <UnifiedPaymentButton
                      planType="professional"
                      planName={plan.name}
                      planPrice="18.99"
                      planPeriod="month"
                      className="w-full py-6 text-lg hover-lift btn-pulse"
                    >
                      {plan.buttonText}
                    </UnifiedPaymentButton>
                  ) : plan.buttonText === "Testar (R$ 0,01)" ? (
                    <UnifiedPaymentButton
                      planType="test"
                      planName={plan.name}
                      planPrice="0.01"
                      planPeriod="test"
                      className="w-full py-6 text-lg hover-lift btn-pulse"
                    >
                      {plan.buttonText}
                    </UnifiedPaymentButton>
                  ) : (
                    <Button 
                      variant={plan.buttonVariant}
                      size="lg"
                      className="w-full py-6 text-lg hover-lift btn-pulse"
                      onClick={() => handlePlanClick(plan.name, plan.buttonText)}
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div 
          className="text-center mt-16"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          <p className="text-muted-foreground mb-4">
            ✓ Garantia de 7 dias • ✓ Cancele quando quiser • ✓ Suporte especializado
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
