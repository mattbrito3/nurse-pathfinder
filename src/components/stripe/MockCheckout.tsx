import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle,
  Shield,
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";

interface MockCheckoutProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MockCheckout: React.FC<MockCheckoutProps> = ({
  planType,
  planName,
  planPrice,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState('usuario@exemplo.com');

  // Auto-fill with test card data
  useEffect(() => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setCardName('João da Silva');
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvc || !cardName) {
      toast.error('Preencha todos os campos do cartão');
      return;
    }

    setIsProcessing(true);
    toast.loading('Processando pagamento...', { id: 'payment' });

    // Simulate payment processing
    setTimeout(() => {
      toast.success('Pagamento aprovado!', { id: 'payment' });
      
      setTimeout(() => {
        onSuccess();
        toast.success('Assinatura ativada com sucesso!', {
          description: `Bem-vindo ao ${planName}!`
        });
        navigate('/pricing?payment=success');
      }, 1000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Checkout Seguro</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">Dose Certa</h2>
            <p className="text-blue-100 text-sm">Pagamento via Stripe</p>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {planName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {planType === 'annual' ? 'Cobrança anual' : 'Cobrança mensal'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {planPrice}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {planType === 'annual' ? '/ano' : '/mês'}
              </p>
            </div>
          </div>
          {planType === 'annual' && (
            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              🎉 Economize 2 meses!
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800"
              disabled
            />
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Informações do Cartão</h3>
              <Badge variant="secondary" className="ml-auto">
                <Lock className="h-3 w-3 mr-1" />
                Seguro
              </Badge>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="pl-10"
                />
                <CreditCard className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-blue-600">
                💳 Cartão de teste pré-preenchido (desenvolvimento)
              </p>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <div className="relative">
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="pl-10"
                  />
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={handleCvcChange}
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="João da Silva"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processando pagamento...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Pagar {planPrice}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Checkout Simulado</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              Este é um checkout de desenvolvimento. Em produção, seria processado pelo Stripe real.
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              SSL Seguro
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              Stripe Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;