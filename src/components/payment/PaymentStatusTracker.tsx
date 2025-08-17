import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  QrCode, 
  Copy, 
  ExternalLink,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { toast } from 'sonner';

interface PaymentResult {
  payment_id: string;
  status: string;
  external_reference: string;
  payment_method: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  boleto_url?: string;
  transaction_amount?: number;
}

interface PaymentStatusTrackerProps {
  paymentResult: PaymentResult;
  onComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

interface PaymentStatus {
  payment_id: string;
  status: string;
  status_detail?: string;
  date_approved?: string;
  date_last_updated?: string;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  paymentResult,
  onComplete,
  onBack
}) => {
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>({
    payment_id: paymentResult.payment_id,
    status: paymentResult.status
  });
  const [isPolling, setIsPolling] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes for PIX
  const [showQRCode, setShowQRCode] = useState(false);
  const [completionCalled, setCompletionCalled] = useState(false); // Evitar múltiplas chamadas

  // Status em português
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          description: 'Aguardando pagamento',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'approved':
        return {
          label: 'Aprovado',
          description: 'Pagamento confirmado',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          label: 'Rejeitado',
          description: 'Pagamento não aprovado',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          description: 'Pagamento cancelado',
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle
        };
      default:
        return {
          label: 'Processando',
          description: 'Verificando status...',
          color: 'bg-blue-100 text-blue-800',
          icon: Loader2
        };
    }
  };

  // Polling do status com limitações
  useEffect(() => {
    if ((currentStatus.status === 'approved' || currentStatus.status === 'rejected') && !completionCalled) {
      setIsPolling(false);
      setCompletionCalled(true); // Marcar como já chamado
      console.log('🎯 Payment completed, calling onComplete only once');
      onComplete({ ...paymentResult, status: currentStatus.status });
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // Máximo 30 tentativas (1.5 minutos)

    const pollStatus = async () => {
      try {
        attempts++;
        
        // Parar após máximo de tentativas
        if (attempts > maxAttempts) {
          console.log('🛑 Polling stopped: Maximum attempts reached');
          setIsPolling(false);
          toast.error('Tempo limite excedido. Verifique o pagamento manualmente.');
          return;
        }

        const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

        const response = await fetch(`${functionsUrl}/get-payment-status/${paymentResult.payment_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        });
        
        if (response.ok) {
          const status = await response.json();
          
          // Só atualizar se o status realmente mudou
          if (status.status !== currentStatus.status) {
            console.log('📊 Payment status updated:', status);
            setCurrentStatus(status);
            
            // Mostrar notificação apenas uma vez
            if (status.status === 'approved' && !completionCalled) {
              toast.success('Pagamento aprovado!', { duration: 3000 });
            }
          }
        } else if (response.status === 401) {
          console.error('🚨 Unauthorized - stopping polling');
          setIsPolling(false);
          toast.error('Erro de autenticação. Recarregue a página e tente novamente.');
        } else {
          console.error('❌ Response not ok:', response.status);
        }
      } catch (error) {
        console.error('❌ Error polling payment status:', error);
        // Parar polling em caso de muitos erros
        if (attempts > 5) {
          setIsPolling(false);
          toast.error('Erro no monitoramento. Verifique manualmente.');
        }
      }
    };

    if (isPolling) {
      const interval = setInterval(pollStatus, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isPolling, currentStatus.status, paymentResult, onComplete]);

  // Countdown para PIX
  useEffect(() => {
    if (paymentResult.payment_method === 'pix' && currentStatus.status === 'pending') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentResult.payment_method, currentStatus.status]);

  // Auto-start polling for pending payments
  useEffect(() => {
    if (currentStatus.status === 'pending') {
      setIsPolling(true);
    }
  }, [currentStatus.status]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Código PIX copiado!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Erro ao copiar código');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const statusInfo = getStatusInfo(currentStatus.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
              <span>Status do Pagamento</span>
            </CardTitle>
            <CardDescription>
              ID: {paymentResult.payment_id}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
          <div className="flex items-center space-x-2">
            {isPolling && (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Verificando...
              </div>
            )}
            {!isPolling && currentStatus.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPolling(true)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Verificar
              </Button>
            )}
          </div>
        </div>

        {/* Status Description */}
        <Alert>
          <StatusIcon className="h-4 w-4" />
          <AlertDescription>
            {statusInfo.description}
            {currentStatus.status === 'pending' && paymentResult.payment_method === 'pix' && (
              <span className="block mt-1 text-sm">
                Tempo restante: {formatTime(countdown)}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* PIX QR Code */}
        {paymentResult.payment_method === 'pix' && paymentResult.qr_code && currentStatus.status === 'pending' && (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowQRCode(!showQRCode)}
                className="mb-4"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQRCode ? 'Ocultar' : 'Mostrar'} QR Code
              </Button>
            </div>

            {showQRCode && paymentResult.qr_code_base64 && (
              <div className="text-center space-y-4">
                <img
                  src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="mx-auto border rounded-lg"
                  style={{ maxWidth: '200px' }}
                />
                <p className="text-sm text-muted-foreground">
                  Escaneie com o app do seu banco
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                  {paymentResult.qr_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentResult.qr_code!)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {paymentResult.ticket_url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(paymentResult.ticket_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir no Mercado Pago
              </Button>
            )}
          </div>
        )}

        {/* Boleto */}
        {paymentResult.payment_method === 'bolbancario' && paymentResult.boleto_url && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Seu boleto foi gerado. Pague até o vencimento para ativar seu plano.
              </AlertDescription>
            </Alert>
            
            <Button
              className="w-full"
              onClick={() => window.open(paymentResult.boleto_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Boleto
            </Button>
          </div>
        )}

        {/* Credit Card Success */}
        {paymentResult.payment_method === 'credit_card' && currentStatus.status === 'approved' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Pagamento aprovado! Seu plano foi ativado automaticamente.
              Redirecionando para o dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Error States */}
        {currentStatus.status === 'rejected' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Pagamento não aprovado. Tente novamente com outro método de pagamento ou entre em contato conosco.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Details */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Método:</span>
            <span className="capitalize">{paymentResult.payment_method.replace('_', ' ')}</span>
          </div>
          {paymentResult.transaction_amount && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span>R$ {paymentResult.transaction_amount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Referência:</span>
            <span className="font-mono text-xs">{paymentResult.external_reference}</span>
          </div>
          {currentStatus.date_last_updated && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span>{new Date(currentStatus.date_last_updated).toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusTracker;
