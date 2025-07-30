import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/lib/stripe';
import { toast } from 'sonner';
import PaymentMethodSelector from './PaymentMethodSelector';
import AbacatePayButton from './AbacatePayButton';
import { PaymentMethod } from './PaymentMethodSelector';

interface UnifiedPaymentButtonProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  children?: React.ReactNode;
}

const UnifiedPaymentButton: React.FC<UnifiedPaymentButtonProps> = ({
  planType,
  planName,
  planPrice,
  planPeriod,
  className,
  children
}) => {
  const { user } = useAuth();
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    setIsProcessingStripe(true);

    try {
      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planType,
          userId: user.id,
          successUrl: `${window.location.origin}/pricing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?payment=canceled`,
        },
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data.sessionId) {
        throw new Error('No session ID received from server');
      }

      // Redirect to Stripe Checkout using the sessionId
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        console.error('❌ Stripe redirect error:', stripeError);
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
    console.log('Payment successful:', paymentData);
    toast.success('Pagamento aprovado! Redirecionando...');
    
    // Redirect to success page
    setTimeout(() => {
      window.location.href = `/pricing?payment=success&method=${paymentData.method}`;
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Erro no pagamento', {
      description: 'Tente novamente ou escolha outro método'
    });
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowMethodSelector(false);
  };

  // Se o método selecionado for Stripe, processar checkout
  if (selectedMethod === 'stripe') {
    return (
      <Button
        onClick={handleStripeCheckout}
        disabled={isProcessingStripe}
        className={className}
      >
        {isProcessingStripe ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : children ? (
          children
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagar com Cartão - {planPrice}{planPeriod}
          </>
        )}
      </Button>
    );
  }

  // Se o método selecionado for AbacatePay, mostrar componente PIX
  if (selectedMethod === 'abacatepay') {
    return (
      <AbacatePayButton
        planName={planName}
        planPrice={planPrice}
        planPeriod={planPeriod}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  // Seletor de método de pagamento
  if (showMethodSelector) {
    return (
      <div className="space-y-4">
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={handleMethodChange}
          planName={planName}
          planPrice={planPrice}
          planPeriod={planPeriod}
        />
        <Button
          variant="outline"
          onClick={() => setShowMethodSelector(false)}
          className="w-full"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  // Botão inicial para escolher método
  return (
    <Button
      onClick={() => setShowMethodSelector(true)}
      className={className}
    >
      {children ? (
        children
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Escolher Forma de Pagamento
        </>
      )}
      <ChevronDown className="h-4 w-4 ml-2" />
    </Button>
  );
};

export default UnifiedPaymentButton; 