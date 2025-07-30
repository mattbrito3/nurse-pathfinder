import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
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

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    // Criar URL com parâmetros do plano
    const checkoutUrl = `/payment-checkout?${new URLSearchParams({
      planType,
      planName,
      planPrice,
      planPeriod
    }).toString()}`;

    // Abrir em nova aba
    window.open(checkoutUrl, '_blank');
  };

  return (
    <Button
      onClick={handleCheckoutRedirect}
      className={className}
    >
      {children ? (
        children
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Assinar Agora
        </>
      )}
    </Button>
  );
};

export default UnifiedPaymentButton; 