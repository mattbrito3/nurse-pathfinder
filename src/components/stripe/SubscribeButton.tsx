import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import getStripe from '@/lib/stripe';
import { toast } from 'sonner';

interface SubscribeButtonProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  className?: string;
  children?: React.ReactNode;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  planType,
  planName,
  planPrice,
  className,
  children
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    setIsLoading(true);
    console.log('🚀 Starting checkout process for:', planType);

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

      console.log('✅ Checkout session created:', data.sessionId);

      // Redirect to Stripe Checkout using the sessionId
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('🔄 Redirecting to Stripe Checkout...');
      
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
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Assinar {planName}
        </>
      )}
    </Button>
  );
};

export default SubscribeButton;