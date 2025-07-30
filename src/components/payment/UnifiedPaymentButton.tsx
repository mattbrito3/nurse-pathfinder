import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/lib/stripe';
import { toast } from 'sonner';

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    setIsProcessing(true);

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
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleStripeCheckout}
      disabled={isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Assinar com Cartão
        </>
      )}
    </Button>
  );
};

export default UnifiedPaymentButton; 