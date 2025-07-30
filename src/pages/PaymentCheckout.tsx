import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, QrCode, Check, Shield, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/lib/stripe';
import AbacatePayButton from '@/components/payment/AbacatePayButton';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Dados do plano vindos da URL
  const planType = searchParams.get('planType') as 'professional' | 'annual' || 'professional';
  const planName = searchParams.get('planName') || 'Estudante';
  const planPrice = searchParams.get('planPrice') || 'R$ 29,00';
  const planPeriod = searchParams.get('planPeriod') || '/mês';
  
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'abacatepay' | null>(null);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  // Se não há usuário logado, redirecionar para login
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleStripeCheckout = async () => {
    setIsProcessingStripe(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planType,
          userId: user.id,
          successUrl: `${window.location.origin}/pricing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?payment=canceled`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data.sessionId) {
        throw new Error('No session ID received from server');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Failed to redirect to checkout');
      }

    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      toast.error('Erro ao processar pagamento', {
        description: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setIsProcessingStripe(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast.success('Pagamento aprovado! Redirecionando...');
    setTimeout(() => {
      navigate('/pricing?payment=success&method=pix');
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Erro no pagamento', {
      description: 'Tente novamente ou escolha outro método'
    });
  };

  // Se método PIX foi selecionado, mostrar interface do PIX
  if (selectedMethod === 'abacatepay') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos métodos
            </Button>
            
            <AbacatePayButton
              planName={planName}
              planPrice={planPrice}
              planPeriod={planPeriod}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos planos
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Finalizar Pagamento
            </h1>
            <p className="text-muted-foreground">
              Escolha sua forma de pagamento preferida
            </p>
          </div>

          {/* Resumo do Plano */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{planName}</h3>
                  <p className="text-muted-foreground">Acesso completo à plataforma</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{planPrice}</div>
                  <div className="text-sm text-muted-foreground">{planPeriod}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Título dos Métodos */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Forma de Pagamento
            </h2>
            <p className="text-muted-foreground">
              Selecione como você prefere pagar
            </p>
          </div>

          {/* Métodos de Pagamento */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* PIX */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedMethod === 'abacatepay' 
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => setSelectedMethod('abacatepay')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <QrCode className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">PIX</CardTitle>
                      <CardDescription>Pagamento instantâneo</CardDescription>
                    </div>
                  </div>
                  {selectedMethod === 'abacatepay' && (
                    <Badge className="bg-green-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                </div>
                
                {/* Selo de desconto PIX */}
                <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-3">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Até 22% de desconto com aprovação imediata
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Aprovação instantânea</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Sem taxas adicionais</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Seguro e confiável</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Clock className="h-4 w-4" />
                    <span>Pagamento em até 2 minutos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cartão de Crédito */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedMethod === 'stripe' 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedMethod('stripe')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cartão de Crédito</CardTitle>
                      <CardDescription>Visa, Mastercard, Elo</CardDescription>
                    </div>
                  </div>
                  {selectedMethod === 'stripe' && (
                    <Badge className="bg-blue-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Parcelamento disponível</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Pagamento seguro via Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Shield className="h-4 w-4" />
                    <span>Proteção internacional</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Aceita cartões internacionais</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Continuar */}
          {selectedMethod && (
            <div className="text-center">
              <Button
                size="lg"
                className={`px-8 py-4 text-lg font-semibold ${
                  selectedMethod === 'abacatepay' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isProcessingStripe}
                onClick={selectedMethod === 'stripe' ? handleStripeCheckout : () => setSelectedMethod('abacatepay')}
              >
                {isProcessingStripe ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    {selectedMethod === 'abacatepay' ? (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        Continuar com PIX
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Continuar com Cartão
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Informações de Segurança */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              <span>Pagamentos seguros e criptografados</span>
            </div>
            <p>
              Seus dados estão protegidos por criptografia SSL de 256 bits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;