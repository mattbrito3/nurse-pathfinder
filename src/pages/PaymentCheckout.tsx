import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Check, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Dados do plano vindos da URL
  const planType = searchParams.get('planType') as 'professional' | 'annual' || 'professional';
  const planName = searchParams.get('planName') || 'Estudante';
  const planPrice = searchParams.get('planPrice') || 'R$ 29,00';
  const planPeriod = searchParams.get('planPeriod') || '/mês';

  // Se não há usuário logado, redirecionar para login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePaymentMaintenance = () => {
    // 🚧 Placeholder durante remoção do Stripe
    toast.info('Sistema de pagamentos em atualização', {
      description: `Estamos implementando uma nova solução de pagamento mais segura. Em breve você poderá assinar o plano ${planName}!`,
      duration: 5000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos planos
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Sistema de Pagamentos
            </h1>
            <p className="text-muted-foreground">
              Implementando nova solução de pagamento mais segura
            </p>
          </div>

          {/* Resumo do Plano */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{planName}</h3>
                  <p className="text-muted-foreground">Acesso completo à plataforma</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{planPrice}</div>
                  <div className="text-sm text-muted-foreground">{planPeriod}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema em Manutenção */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Em Breve - Nova Solução
            </h2>

            <Card className="border-2 border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 max-w-lg mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Sistema em Atualização</CardTitle>
                <CardDescription>Implementando nova solução de pagamento</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span>Nova solução em desenvolvimento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Check className="h-4 w-4" />
                    <span>Mais opções de pagamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Shield className="h-4 w-4" />
                    <span>Maior segurança</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Check className="h-4 w-4" />
                    <span>Processamento mais rápido</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
                  disabled={false}
                  onClick={handlePaymentMaintenance}
                >
                  <Wrench className="h-5 w-5 mr-2" />
                  Em Breve - Aguarde Novidades
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre Atualização */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wrench className="h-4 w-4" />
              <span>Sistema em atualização para melhor experiência</span>
            </div>
            <p>
              Em breve teremos uma nova solução de pagamento mais segura e eficiente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;