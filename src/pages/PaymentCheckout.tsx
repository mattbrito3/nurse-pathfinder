import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Check, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/lib/stripe';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Dados do plano vindos da URL
  const planType = searchParams.get('planType') as 'professional' | 'annual' || 'professional';
  const planName = searchParams.get('planName') || 'Estudante';
  const planPrice = searchParams.get('planPrice') || 'R$ 29,00';
  const planPeriod = searchParams.get('planPeriod') || '/mês';
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Se não há usuário logado, redirecionar para login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleStripeCheckout = async () => {
    setIsProcessing(true);

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
      setIsProcessing(false);
    }
  };

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

          {/* Método de Pagamento - Stripe */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Pagamento Seguro
            </h2>

            <Card className="border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 max-w-lg mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Cartão de Crédito</CardTitle>
                <CardDescription>Pagamento seguro via Stripe</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Parcelamento disponível</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Aceita Visa, Mastercard, Elo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Shield className="h-4 w-4" />
                    <span>Proteção internacional</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Check className="h-4 w-4" />
                    <span>Criptografia SSL 256 bits</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                  onClick={handleStripeCheckout}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pagar {planPrice}{planPeriod}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

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