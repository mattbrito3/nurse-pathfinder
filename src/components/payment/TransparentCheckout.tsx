import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, QrCode, Receipt } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import CardPaymentForm from './CardPaymentForm';
import PixPaymentForm from './PixPaymentForm';
import PaymentStatusTracker from './PaymentStatusTracker';

interface TransparentCheckoutProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface PaymentResult {
  payment_id: string;
  status: string;
  external_reference: string;
  payment_method: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  boleto_url?: string;
}

const TransparentCheckout: React.FC<TransparentCheckoutProps> = ({
  planType,
  planName,
  planPrice,
  planPeriod,
  className,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('card');

  // Carregar SDK do MercadoPago
  useEffect(() => {
    const initMercadoPago = async () => {
      try {
        await loadMercadoPago();
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        
        if (!publicKey) {
          console.error('❌ MercadoPago Public Key não encontrada');
          toast.error('Configuração de pagamento incompleta');
          return;
        }

        // @ts-ignore - MercadoPago SDK types
        window.MercadoPago = new window.MercadoPago(publicKey);
        setMpLoaded(true);
        console.log('✅ MercadoPago SDK loaded successfully');
      } catch (error) {
        console.error('❌ Error loading MercadoPago SDK:', error);
        toast.error('Erro ao carregar sistema de pagamento');
        setMpLoaded(false);
      }
    };

    initMercadoPago();
  }, []);

  const extractAmount = (priceString: string): number => {
    let amount = parseFloat(priceString.replace('R$', '').replace(',', '.').trim());
    
    // Forçar valor via env se configurado (para testes)
    const forced = import.meta.env.VITE_MP_FORCE_AMOUNT;
    if (forced && !Number.isNaN(parseFloat(forced))) {
      amount = parseFloat(forced);
    }
    
    return amount;
  };

  const createPayment = async (paymentData: any) => {
    if (!user) {
      toast.error('Faça login para continuar');
      return null;
    }

    setIsLoading(true);

    try {
      const amount = extractAmount(planPrice);
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

      const requestData = {
        userId: user.id,
        planName,
        amount,
        paymentMethod: paymentData.paymentMethod,
        token: paymentData.token,
        payerInfo: paymentData.payerInfo,
        installments: paymentData.installments,
        issuer_id: paymentData.issuer_id
      };

      console.log('💳 Creating transparent payment:', requestData);

      const response = await fetch(`${functionsUrl}/create-transparent-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }

      const result = await response.json();
      console.log('✅ Payment created:', result);

      setCurrentPayment(result);
      
      if (onSuccess) {
        onSuccess();
      }

      return result;

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error('Erro ao processar pagamento', {
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes'
      });
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = (paymentResult: PaymentResult) => {
    setCurrentPayment(paymentResult);
    
    // Se pagamento foi aprovado, redirecionar para dashboard
    if (paymentResult.status === 'approved') {
      toast.success('Pagamento aprovado!', {
        description: 'Seu plano foi ativado com sucesso'
      });
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  };

  // Se temos um pagamento em andamento, mostrar o tracker
  if (currentPayment) {
    return (
      <div className={className}>
        <PaymentStatusTracker 
          paymentResult={currentPayment}
          onComplete={handlePaymentComplete}
          onBack={() => setCurrentPayment(null)}
        />
      </div>
    );
  }

  if (!mpLoaded) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando sistema de pagamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Checkout Transparente</CardTitle>
        <CardDescription>
          Plano {planName} - {planPrice}/{planPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Cartão</span>
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>PIX</span>
            </TabsTrigger>
            <TabsTrigger value="boleto" className="flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Boleto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="mt-6">
            <CardPaymentForm 
              onPaymentCreate={createPayment}
              isLoading={isLoading}
              amount={extractAmount(planPrice)}
            />
          </TabsContent>

          <TabsContent value="pix" className="mt-6">
            <PixPaymentForm 
              onPaymentCreate={createPayment}
              isLoading={isLoading}
              amount={extractAmount(planPrice)}
            />
          </TabsContent>

          <TabsContent value="boleto" className="mt-6">
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Boleto bancário em implementação
              </p>
              <Button 
                variant="outline" 
                disabled
                className="w-full"
              >
                Em breve
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransparentCheckout;
