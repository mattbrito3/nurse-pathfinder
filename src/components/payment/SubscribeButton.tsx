import React from 'react';
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
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

  const handlePaymentMaintenance = async () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    // 🚧 Placeholder durante remoção do Stripe
    toast.info('Sistema de pagamentos em atualização', {
      description: `Estamos implementando uma nova solução de pagamento mais segura. Em breve você poderá assinar o plano ${planName}!`,
      duration: 5000
    });
  };

  return (
    <Button
      onClick={handlePaymentMaintenance}
      disabled={false}
      className={`${className} opacity-75`}
      variant="outline"
    >
      {children ? (
        children
      ) : (
        <>
          <Wrench className="h-4 w-4 mr-2" />
          Em Breve - Nova Solução
        </>
      )}
    </Button>
  );
};

export default SubscribeButton;