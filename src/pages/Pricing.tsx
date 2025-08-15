import { useEffect, useState } from 'react';
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
  TrendingUp,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import UnifiedPaymentButton from '@/components/payment/UnifiedPaymentButton';
import PaymentStatusBanner from '@/components/payment/PaymentStatusBanner';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isActive, planName, checkSubscription, startPaymentPolling } = useSubscription();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending' | null>(null);

  // Planos simplificados - apenas Estudante
  const plans = [
    {
      id: 1,
      name: "Gratuito",
      price: 0,
      interval: "month",
      description: "Perfeito para começar seus estudos",
      features: [
        "Calculadora básica de medicação",
        "Acesso a 100 termos do glossário",
        "50 flashcards por mês",
        "Direito a 7 usos diários na calculadora",
        "Acesso básico ao dashboard"
      ],
      popular: false
    },
    {
      id: 2,
      name: "Estudante",
      price: 18.99,
      interval: "month",
      description: "Ideal para estudantes de enfermagem",
      features: [
        "Calculadora avançada de medicação",
        "Acesso completo ao glossário médico",
        "Flashcards ilimitados",
        "Acesso offline a todo conteúdo",
        "Histórico detalhado de progresso",
        "Sistema de repetição espaçada",
        "Análises de performance avançadas",
        "Suporte prioritário por email",
        "Sincronização em nuvem",
        "Acesso mobile completo"
      ],
      popular: true
    }
  ];

  // Sistema de polling para verificar pagamento
  const handlePaymentPolling = async () => {
    if (!user?.id || isCheckingPayment) return;
    
    setIsCheckingPayment(true);
    
    startPaymentPolling(
      // onSuccess
      () => {
        toast.success('Pagamento confirmado!', {
          description: 'Sua assinatura está ativa. Redirecionando para o dashboard...'
        });
        navigate('/dashboard', { replace: true });
      },
      // onTimeout
      () => {
        setIsCheckingPayment(false);
        toast.info('Pagamento ainda em processamento', {
          description: 'O pagamento PIX pode demorar alguns minutos. Você será redirecionado automaticamente quando for confirmado.'
        });
      },
      60, // maxAttempts
      1000 // pollInterval
    );
  };

  // Verificar status do pagamento e redirecionar se necessário
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference');
    
    console.log('🔍 Payment status check:', { paymentStatus, paymentId, externalReference });
    
    // Check if user is returning from payment and prevent logout
    const userBeforePayment = sessionStorage.getItem('user_before_payment');
    if (userBeforePayment && !user && (paymentStatus || paymentId || externalReference)) {
      console.log('🔄 User returned from payment but was logged out, showing message...');
      toast.info('Sessão expirada após pagamento', {
        description: 'Faça login novamente para verificar seu pagamento',
        duration: 5000
      });
      // Don't clear the session storage yet, let user login first
      return;
    }
    
    if (paymentStatus === 'success' || paymentStatus === 'approved') {
      console.log('✅ Payment successful, starting verification...');
      
      // Clear stored payment session since user is back and logged in
      sessionStorage.removeItem('user_before_payment');
      
      // Mostrar banner de sucesso
      setPaymentStatus('success');
      
      // Iniciar verificação automática da assinatura
      const checkInterval = setInterval(async () => {
        try {
          console.log('🔄 Pricing: Checking subscription status...');
          await checkSubscription();
          
          console.log('📊 Pricing: Current subscription status:', { isActive, planName });
          
          // Toast visual para debug em produção
          if (isActive) {
            toast.success(`🎉 Assinatura confirmada: ${planName}!`);
          } else {
            toast.info('🔄 Verificando status da assinatura...', {
              description: 'Aguardando confirmação do pagamento'
            });
          }
          
          // Se a assinatura estiver ativa, redirecionar
          if (isActive) {
            console.log('🎉 Pricing: Subscription active, redirecting to dashboard...');
            clearInterval(checkInterval);
            toast.success('Pagamento confirmado! Redirecionando para o dashboard...');
            navigate('/dashboard?payment=success');
          }
        } catch (error) {
          console.error('❌ Pricing: Error checking subscription:', error);
        }
      }, 3000); // Verificar a cada 3 segundos
      
      // Parar verificação após 2 minutos
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isActive) {
          console.log('⚠️ Subscription not activated after 2 minutes');
          toast.info('Pagamento processado! Verificando status da assinatura...');
        }
      }, 120000);
      
      return () => clearInterval(checkInterval);
    } else if (paymentStatus === 'failure' || paymentStatus === 'rejected') {
      console.log('❌ Payment failed');
      setPaymentStatus('error');
      toast.error('Pagamento não foi aprovado. Tente novamente.');
    } else if (paymentStatus === 'pending') {
      console.log('⏳ Payment pending');
      setPaymentStatus('pending');
      toast.info('Pagamento PIX em processamento. Aguarde a confirmação.');
      
      // Para PIX, também iniciar verificação automática (pode demorar mais)
      const checkInterval = setInterval(async () => {
        try {
          console.log('🔄 Checking subscription status for PIX payment...');
          await checkSubscription();
          
          // Se a assinatura estiver ativa, redirecionar
          if (isActive) {
            console.log('🎉 PIX payment confirmed, redirecting to dashboard...');
            clearInterval(checkInterval);
            setPaymentStatus('success');
            toast.success('Pagamento PIX confirmado! Redirecionando para o dashboard...');
            navigate('/dashboard?payment=success');
          }
        } catch (error) {
          console.error('❌ Error checking subscription for PIX:', error);
        }
      }, 5000); // Verificar a cada 5 segundos para PIX
      
      // Parar verificação após 10 minutos (PIX pode demorar mais)
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isActive) {
          console.log('⚠️ PIX payment not confirmed after 10 minutes');
          toast.info('Pagamento PIX ainda em processamento. Atualize a página em alguns minutos.');
        }
      }, 600000); // 10 minutos
      
      return () => clearInterval(checkInterval);
    }
  }, [searchParams, isActive, checkSubscription, navigate]);

  // Helper functions
  const getPlanType = (planName: string): 'professional' | 'annual' => {
    const name = planName.toLowerCase();
    if (name.includes('estudante')) return 'professional';
    return 'professional';
  };

  const getCurrentPlanName = () => {
    if (isActive && planName) {
      return planName;
    }
    return 'Gratuito';
  };

  const isCurrentPlan = (planName: string) => {
    return getCurrentPlanName() === planName;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'R$ 0';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Desbloqueie todo o potencial do DoseCerta
          </p>
        </div>

        {/* Payment Status Banner */}
               {paymentStatus === 'success' && (
         <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="flex-shrink-0">
                 <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
               </div>
               <div>
                 <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                   Pagamento Confirmado!
                 </h3>
                 <p className="text-green-700 dark:text-green-300">
                   Seu pagamento foi processado com sucesso. Verificando status da assinatura...
                 </p>
                 <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                   Status atual: {isActive ? `✅ Ativo (${planName})` : '⏳ Aguardando ativação'}
                 </p>
               </div>
             </div>
             <div className="flex gap-2">
               <Button
                 onClick={async () => {
                   toast.info('🔄 Verificando assinatura...');
                   await checkSubscription();
                 }}
                 variant="outline"
                 className="border-green-600 text-green-600 hover:bg-green-50"
               >
                 🔄 Verificar
               </Button>
               <Button
                 onClick={() => navigate('/dashboard')}
                 className="bg-green-600 hover:bg-green-700 text-white"
               >
                 Ir para o Dashboard
               </Button>
             </div>
           </div>
         </div>
       )}

        {paymentStatus === 'error' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Pagamento Não Aprovado
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  Houve um problema com o pagamento. Tente novamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Pagamento em Processamento
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Aguarde a confirmação do pagamento PIX.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
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
                      <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                    ) : isPopular ? (
                      <Zap className="h-12 w-12 mx-auto text-primary" />
                    ) : (
                      <Shield className="h-12 w-12 mx-auto text-orange-500" />
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
                        variant="medical" 
                        className="w-full"
                        onClick={() => navigate('/register')}
                      >
                        Começar Grátis
                      </Button>
                    ) : (
                      <UnifiedPaymentButton
                        planType={getPlanType(plan.name)}
                        planName={plan.name}
                        planPrice={formatPrice(plan.price)}
                        planPeriod="/mês"
                        className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        onSuccess={() => {
                          toast.info('Redirecionando para o pagamento...', {
                            description: 'Aguarde enquanto preparamos seu pagamento.'
                          });
                        }}
                        onError={(error) => {
                          console.error('Erro no pagamento:', error);
                          toast.error('Erro ao iniciar pagamento', {
                            description: 'Tente novamente em alguns instantes.'
                          });
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Assinar Plano
                      </UnifiedPaymentButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-background rounded-lg border p-8 max-w-4xl mx-auto">
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
                </tr>
                <tr>
                  <td className="py-4 pr-6 font-medium">Calculadora de medicação</td>
                  <td className="text-center py-4 px-4">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-6 font-medium">Acesso offline</td>
                  <td className="text-center py-4 px-4">
                    <X className="h-5 w-5 text-red-400 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-6 font-medium">Análises avançadas</td>
                  <td className="text-center py-4 px-4">
                    <X className="h-5 w-5 text-red-400 mx-auto" />
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
  );
};

export default Pricing;
