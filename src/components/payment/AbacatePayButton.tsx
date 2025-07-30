import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CustomerDataForm from './CustomerDataForm';

interface AbacatePayButtonProps {
  planName: string;
  planPrice: string;
  planPeriod: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
}

const AbacatePayButton: React.FC<AbacatePayButtonProps> = ({
  planName,
  planPrice,
  planPeriod,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeText: string;
    paymentId: string;
    expiresAt: string;
  } | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const handlePixPayment = async (customerData: any) => {
    try {
      setIsLoading(true);

      // Calcular amount corretamente - remover R$ e normalizar formato
      let priceValue = planPrice.replace('R$ ', '').trim();
      
      // Normalizar formato de número (BR ou US)
      if (priceValue.includes(',') && !priceValue.includes('.')) {
        // Formato brasileiro: 29,90 -> 29.90
        priceValue = priceValue.replace(',', '.');
      } else if (priceValue.includes(',') && priceValue.includes('.')) {
        // Formato brasileiro com milhares: 1.234,50 -> 1234.50
        priceValue = priceValue.replace(/\./g, '').replace(',', '.');
      }
      
      const amount = parseFloat(priceValue);
      
      console.log('💰 Price processing:', {
        planPrice,
        priceValue,
        amount,
        isValidAmount: !isNaN(amount) && amount > 0
      });

      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount: ${planPrice} -> ${amount}`);
      }

      const requestBody = {
        planType: 'professional', // TODO: Passar planType dinamicamente
        userId: user?.id,
        amount: amount,
        description: `Plano ${planName} - Nurse Pathfinder`,
        customerData: {
          name: customerData.name,
          email: customerData.email,
          cellphone: customerData.cellphone,
          taxId: customerData.taxId
        }
      };

      console.log('📤 Sending to abacatepay-pix:', requestBody);

      // Call Supabase Edge Function to generate PIX
      const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
        body: requestBody,
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(error.message || 'Failed to generate PIX');
      }

      if (!data.success || !data.pixData) {
        throw new Error('No PIX data received from server');
      }

      setPixData(data.pixData);
      setShowCustomerForm(false);
      
      // Iniciar polling para verificar pagamento
      startPaymentPolling(data.pixData.paymentId);

    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error('Erro ao gerar PIX. Tente novamente.');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        // Verificar status do pagamento via Edge Function
        const { data, error } = await supabase.functions.invoke('abacatepay-status', {
          body: { paymentId }
        });

        if (error) {
          console.error('❌ Status check error:', error);
          return;
        }

        if (data.success && data.isPaid) {
          clearInterval(interval);
          setIsPaid(true);
          toast.success('Pagamento aprovado! Redirecionando...');
          
          // Invalidar cache da subscription para forçar reload
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
          onSuccess?.({ paymentId, method: 'pix' });
        } else if (data.status === 'EXPIRED') {
          clearInterval(interval);
          toast.error('PIX expirado. Gere um novo PIX.');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Limpar intervalo após 30 minutos
    setTimeout(() => {
      clearInterval(interval);
    }, 30 * 60 * 1000);
  };

  const copyPixCode = async () => {
    if (!pixData) return;
    
    try {
      await navigator.clipboard.writeText(pixData.qrCodeText);
      toast.success('Código PIX copiado!');
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };

  const openPixApp = () => {
    if (!pixData) return;
    
    // Abrir app PIX ou gerar link
    const pixUrl = `pix://${pixData.qrCodeText}`;
    window.open(pixUrl, '_blank');
  };

  // Mostrar formulário de dados do cliente
  if (showCustomerForm) {
    return (
      <CustomerDataForm
        planName={planName}
        planPrice={planPrice}
        planPeriod={planPeriod}
        onSubmit={handlePixPayment}
        onBack={() => window.history.back()}
        isLoading={isLoading}
      />
    );
  }

  if (isPaid) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Pagamento Aprovado!
          </h3>
          <p className="text-green-700">
            Seu plano {planName} foi ativado com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (pixData) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-600" />
            PIX Gerado
          </CardTitle>
          <CardDescription>
            Escaneie o QR Code ou copie o código PIX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img 
                src={pixData.qrCode} 
                alt="QR Code PIX" 
                className="w-48 h-48 mx-auto"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Código PIX:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPixCode}
                className="h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-2 rounded text-xs font-mono break-all">
              {pixData.qrCodeText}
            </div>
          </div>

                     <div className="flex gap-2">
             <Button 
               onClick={openPixApp}
               className="flex-1"
               variant="outline"
             >
               <ExternalLink className="h-4 w-4 mr-2" />
               Abrir App PIX
             </Button>
             <Button 
               onClick={copyPixCode}
               className="flex-1"
             >
               <Copy className="h-4 w-4 mr-2" />
               Copiar Código
             </Button>
           </div>
           
           {/* Botão de simulação apenas para desenvolvimento */}
           {process.env.NODE_ENV === 'development' && (
             <Button 
               onClick={async () => {
                 try {
                   const { data, error } = await supabase.functions.invoke('abacatepay-simulate', {
                     body: { paymentId: pixData.paymentId }
                   });
                   
                   if (error) {
                     toast.error('Erro ao simular pagamento');
                   } else {
                     toast.success('Pagamento simulado com sucesso!');
                   }
                 } catch (error) {
                   toast.error('Erro ao simular pagamento');
                 }
               }}
               variant="outline"
               className="w-full bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
             >
               🎮 Simular Pagamento (Dev)
             </Button>
           )}

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              Expira em: {new Date(pixData.expiresAt).toLocaleTimeString('pt-BR')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Este ponto não deveria ser alcançado, mas deixamos como fallback
  return (
    <Button
      onClick={() => setShowCustomerForm(true)}
      disabled={isLoading}
      size="lg"
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      <QrCode className="h-4 w-4 mr-2" />
      Pagar com PIX - {planPrice}{planPeriod}
    </Button>
  );
};

export default AbacatePayButton; 