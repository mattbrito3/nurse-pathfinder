import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  ExternalLink, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import MercadoPagoButton from './MercadoPagoButton';
import TransparentCheckout from './TransparentCheckout';

interface PaymentMigrationToggleProps {
  planType: 'professional' | 'annual' | 'test';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  // Feature flag - pode vir de variáveis de ambiente ou context
  forceTransparent?: boolean;
  forceClassic?: boolean;
}

type PaymentMode = 'classic' | 'transparent';

const PaymentMigrationToggle: React.FC<PaymentMigrationToggleProps> = ({
  planType,
  planName,
  planPrice,
  planPeriod,
  className,
  onSuccess,
  onError,
  forceTransparent = false,
  forceClassic = false
}) => {
  // Verificar feature flags via env
  const enableTransparent = import.meta.env.VITE_ENABLE_TRANSPARENT_CHECKOUT === 'true';
  const defaultMode = import.meta.env.VITE_DEFAULT_PAYMENT_MODE as PaymentMode || 'classic';
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(() => {
    // Prioridade: forceFlags > localStorage > defaultMode
    if (forceTransparent) return 'transparent';
    if (forceClassic) return 'classic';
    
    const stored = localStorage.getItem('payment_mode') as PaymentMode;
    if (stored && (stored === 'classic' || stored === 'transparent')) {
      return stored;
    }
    
    return defaultMode;
  });

  const [isDebugMode, setIsDebugMode] = useState(() => {
    return import.meta.env.VITE_DEBUG_PAYMENT === 'true' || import.meta.env.DEV;
  });

  // Salvar preferência no localStorage
  useEffect(() => {
    if (!forceTransparent && !forceClassic) {
      localStorage.setItem('payment_mode', paymentMode);
    }
  }, [paymentMode, forceTransparent, forceClassic]);

  const handleModeChange = (newMode: PaymentMode) => {
    if (forceTransparent || forceClassic) return; // Não permite mudança se forçado
    setPaymentMode(newMode);
  };

  const getModeInfo = (mode: PaymentMode) => {
    switch (mode) {
      case 'classic':
        return {
          title: 'Checkout Clássico',
          description: 'Redireciona para página do Mercado Pago',
          pros: ['Testado e estável', 'Todos os métodos de pagamento', 'Experiência conhecida'],
          cons: ['Redirecionamento necessário', 'Menos controle visual'],
          badge: 'Estável',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'transparent':
        return {
          title: 'Checkout Transparente',
          description: 'Pagamento direto na nossa página',
          pros: ['Sem redirecionamento', 'Melhor UX', 'Maior controle visual'],
          cons: ['Em teste', 'Funcionalidades limitadas'],
          badge: 'Beta',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const currentModeInfo = getModeInfo(paymentMode);
  const isForced = forceTransparent || forceClassic;

  return (
    <div className={className}>
      {/* Debug Panel - só mostra em desenvolvimento ou debug mode */}
      {isDebugMode && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Settings className="h-4 w-4" />
              <span>Painel de Debug - Pagamentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">Configuração:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Transparente habilitado: {enableTransparent ? '✅' : '❌'}</li>
                  <li>• Modo padrão: {defaultMode}</li>
                  <li>• Modo atual: {paymentMode}</li>
                  <li>• Forçado: {isForced ? 'Sim' : 'Não'}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Env Vars:</p>
                <ul className="space-y-1 text-muted-foreground font-mono">
                  <li>• PUBLIC_KEY: {import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ? '✅' : '❌'}</li>
                  <li>• ACCESS_TOKEN: {import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN ? '✅' : '❌'}</li>
                  <li>• ENABLE_TRANSPARENT: {enableTransparent ? '✅' : '❌'}</li>
                </ul>
              </div>
            </div>

            {enableTransparent && !isForced && (
              <div className="flex items-center space-x-4 pt-2 border-t">
                <span className="text-sm font-medium">Modo de Pagamento:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={paymentMode === 'classic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('classic')}
                  >
                    Clássico
                  </Button>
                  <Button
                    variant={paymentMode === 'transparent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange('transparent')}
                  >
                    Transparente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações do modo atual */}
      {enableTransparent && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{currentModeInfo.title}</span>
                {' - '}
                <span>{currentModeInfo.description}</span>
              </div>
              <Badge className={currentModeInfo.badgeColor}>
                {currentModeInfo.badge}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Avisos específicos */}
      {paymentMode === 'transparent' && !import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Checkout Transparente não configurado. Public Key do Mercado Pago não encontrada.
          </AlertDescription>
        </Alert>
      )}

      {/* Componente de pagamento baseado no modo */}
      {paymentMode === 'classic' || !enableTransparent ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Checkout Clássico</span>
            </CardTitle>
            <CardDescription>
              Plano {planName} - {planPrice}/{planPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MercadoPagoButton
              planType={planType}
              planName={planName}
              planPrice={planPrice}
              planPeriod={planPeriod}
              onSuccess={onSuccess}
              onError={onError}
              className="w-full"
            />
            
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>Você será redirecionado para o Mercado Pago</p>
              <p>Pagamento 100% seguro</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TransparentCheckout
          planType={planType}
          planName={planName}
          planPrice={planPrice}
          planPeriod={planPeriod}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}

      {/* Footer com informações */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Processado pelo Mercado Pago</span>
        </p>
        {isDebugMode && (
          <p className="mt-1">
            Modo: {paymentMode} | Debug: {isDebugMode ? 'ON' : 'OFF'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMigrationToggle;
