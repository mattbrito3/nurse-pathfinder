import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { mercadopagoService } from '@/services/mercadopagoService';

interface MercadoPagoButtonProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  children?: React.ReactNode;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
  planType,
  planName,
  planPrice,
  planPeriod,
  className,
  children
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Faça login para continuar', {
        description: 'Você precisa estar logado para assinar um plano'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Extract amount from price string (e.g., "R$ 18,99" -> 18.99)
      let amount = parseFloat(planPrice.replace('R$', '').replace(',', '.').trim());
      // Optional: force amount via env for real card low-value testing (e.g., 1.00)
      const forced = (import.meta as any).env.VITE_MP_FORCE_AMOUNT;
      if (forced && !Number.isNaN(parseFloat(forced))) {
        amount = parseFloat(forced);
      }

      // Create payment preference
      const preference = await mercadopagoService.createPreference(
        user.id,
        planName,
        amount
      );

      // Redirect to MercadoPago checkout (open in new tab) and keep this tab aguardando
      const useSandbox = import.meta.env.VITE_USE_MERCADOPAGO_SANDBOX === 'true' || import.meta.env.DEV;
      const checkoutUrl = useSandbox && preference.sandbox_init_point
        ? preference.sandbox_init_point
        : preference.init_point;
      const win = window.open(checkoutUrl, '_blank', 'noopener');
      if (!win) {
        // fallback se popup bloquear: redireciona mesma aba
        window.location.href = checkoutUrl;
        return;
      }
      // Leva o usuário para o dashboard aguardando aprovação (Pix/cash)
      window.location.href = '/dashboard?payment=pending';

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error('Erro ao processar pagamento', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        children ? (
          children
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Assinar Plano
          </>
        )
      )}
    </Button>
  );
};

export default MercadoPagoButton; 