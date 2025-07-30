import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, QrCode, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'stripe' | 'abacatepay';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  planName: string;
  planPrice: string;
  planPeriod: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  planName,
  planPrice,
  planPeriod
}) => {
  const methods = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Cartão de Crédito',
      description: 'Visa, Mastercard, Elo e outros',
      icon: CreditCard,
      benefits: ['Pagamento instantâneo', 'Parcelamento disponível', 'Seguro pela Stripe'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'abacatepay' as PaymentMethod,
      name: 'PIX',
      description: 'Pagamento instantâneo via PIX',
      icon: QrCode,
      benefits: ['Pagamento instantâneo', 'Sem taxas', 'Aprovação imediata'],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Escolha sua forma de pagamento
        </h2>
        <p className="text-muted-foreground">
          Selecione como você prefere pagar o plano {planName}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedMethod === method.id && "ring-2 ring-primary",
              method.borderColor
            )}
            onClick={() => onMethodChange(method.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", method.bgColor)}>
                    <method.icon className={cn("h-5 w-5", method.color)} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Selecionado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Benefícios:</strong>
                </div>
                <ul className="space-y-1">
                  {method.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Resumo do pedido</p>
            <p className="text-sm text-muted-foreground">
              {planName} - {planPrice}{planPeriod}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{planPrice}</p>
            <p className="text-sm text-muted-foreground">{planPeriod}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector; 