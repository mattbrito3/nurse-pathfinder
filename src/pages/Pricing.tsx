import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  ArrowLeft,
  CreditCard,
  Shield,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SimpleCheckout from '@/components/stripe/SimpleCheckout';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    plans,
    currentSubscription,
    plansLoading,
    subscribe,
    isCreatingCheckout,
    formatPrice,
    hasPremiumAccess,
    showCheckout,
    selectedPlan,
    handleCheckoutSuccess,
    handleCheckoutClose
  } = useSubscription();

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Pagamento realizado com sucesso!', {
        description: 'Sua assinatura está ativa. Bem-vindo ao plano premium!'
      });
      navigate('/dashboard', { replace: true });
    } else if (paymentStatus === 'canceled') {
      toast.info('Pagamento cancelado', {
        description: 'Você pode tentar novamente quando quiser.'
      });
    }
  }, [searchParams, navigate]);

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.info('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      navigate('/auth');
      return;
    }

    console.log('🔥 CLICOU ASSINAR - planId:', planId);
    console.log('🔥 showCheckout antes:', showCheckout);
    console.log('🔥 selectedPlan antes:', selectedPlan);
    
    subscribe(planId);
  };

  const getCurrentPlanName = () => {
    if (!currentSubscription) return 'Gratuito';
    return currentSubscription.subscription_plans?.name || 'Gratuito';
  };

  const isCurrentPlan = (planName: string) => {
    return getCurrentPlanName() === planName;
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Site
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Planos e Preços</h1>
            </div>
          </div>
          {user && (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Ir para Dashboard
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Escolha seu plano
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Acelere sua carreira na <span className="text-primary">enfermagem</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Escolha o plano ideal para suas necessidades de estudo e desenvolvimento profissional.
              Cancele a qualquer momento.
            </p>
            
            {/* Current Plan Badge */}
            {user && (
              <div className="mt-6">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Crown className="h-4 w-4 mr-2" />
                  Plano atual: {getCurrentPlanName()}
                </Badge>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const isPopular = plan.popular;
              const isFree = plan.price === 0;
              const isCurrent = isCurrentPlan(plan.name);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    isPopular 
                      ? 'border-primary shadow-lg scale-105 bg-gradient-to-br from-primary/5 to-purple/5' 
                      : 'hover:shadow-md transition-shadow'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute -top-4 right-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mb-4">
                      {isFree ? (
                        <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                      ) : isPopular ? (
                        <Crown className="h-12 w-12 mx-auto text-primary" />
                      ) : (
                        <Zap className="h-12 w-12 mx-auto text-orange-500" />
                      )}
                    </div>
                    
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.interval === 'year' ? '/ano' : '/mês'}
                      </div>
                      {plan.interval === 'year' && plan.price > 0 && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Economize 2 meses!
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Action Button */}
                    <div className="space-y-3">
                      {isCurrent ? (
                        <Button className="w-full" variant="outline" disabled>
                          <Check className="h-4 w-4 mr-2" />
                          Plano Atual
                        </Button>
                      ) : isFree ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => navigate('/auth')}
                        >
                          Começar Grátis
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={isCreatingCheckout}
                        >
                          {isCreatingCheckout ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              {hasPremiumAccess ? 'Trocar Plano' : 'Assinar Agora'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Comparison */}
          <div className="bg-background rounded-lg border p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Compare os recursos</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 pr-6">Recursos</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="text-center py-4 px-4 min-w-[120px]">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-4 pr-6 font-medium">Flashcards por mês</td>
                    <td className="text-center py-4 px-4">50</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-600 font-medium">Ilimitados</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-600 font-medium">Ilimitados</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium">Calculadora de medicação</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium">Analytics avançados</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium">Suporte prioritário</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ or Benefits Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6">Por que escolher o Dose Certa?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Progresso Acelerado</h4>
                <p className="text-muted-foreground text-sm">
                  Sistema de aprendizado adaptativo que acelera sua evolução profissional
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Conteúdo Validado</h4>
                <p className="text-muted-foreground text-sm">
                  Desenvolvido por profissionais experientes e atualizado constantemente
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Resultados Rápidos</h4>
                <p className="text-muted-foreground text-sm">
                  Veja sua performance melhorar desde a primeira semana de uso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Checkout Modal */}
      {(() => {
        console.log('🎯 RENDERIZANDO - showCheckout:', showCheckout, 'selectedPlan:', selectedPlan);
                 return showCheckout && selectedPlan ? (
           <SimpleCheckout
             planType={selectedPlan.type}
             planName={selectedPlan.name}
             planPrice={selectedPlan.price}
             onClose={handleCheckoutClose}
             onSuccess={handleCheckoutSuccess}
           />
         ) : null;
      })()}
    </div>
  );
};

export default Pricing;