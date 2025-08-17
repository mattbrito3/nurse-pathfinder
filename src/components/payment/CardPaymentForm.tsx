import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';

interface CardPaymentFormProps {
  onPaymentCreate: (paymentData: any) => Promise<any>;
  isLoading: boolean;
  amount: number;
}

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  installments: string;
  issuer: string;
}

interface InstallmentOption {
  installments: number;
  installment_rate: number;
  total_amount: number;
  installment_amount: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  thumbnail: string;
  secure_thumbnail: string;
}

interface Issuer {
  id: string;
  name: string;
  thumbnail: string;
  secure_thumbnail: string;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  onPaymentCreate,
  isLoading,
  amount
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: '1',
    issuer: ''
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const cardNumberRef = useRef<HTMLInputElement>(null);

  // Validação de CPF simples
  const isValidCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length === 11 && cpf !== '00000000000';
  };

  // Validação de cartão (algoritmo de Luhn simplificado)
  const isValidCardNumber = (cardNumber: string): boolean => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  };

  // Formatação automática
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\s/g, '');
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formattedValue;
  };

  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Buscar métodos de pagamento quando número do cartão mudar
  useEffect(() => {
    const getPaymentMethods = async () => {
      if (!formData.cardNumber || formData.cardNumber.length < 6) return;

      try {
        const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
        const bin = cleanCardNumber.substring(0, 6);

        // @ts-ignore - MercadoPago SDK
        const paymentMethods = await window.MercadoPago.getPaymentMethods({
          bin: bin
        });

        if (paymentMethods && paymentMethods.length > 0) {
          setPaymentMethods(paymentMethods);
          setCurrentPaymentMethod(paymentMethods[0].id);
          console.log('💳 Payment methods found:', paymentMethods);
        }
      } catch (error) {
        console.error('❌ Error getting payment methods:', error);
      }
    };

    const timeoutId = setTimeout(getPaymentMethods, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.cardNumber]);

  // Buscar emissores quando método de pagamento mudar
  useEffect(() => {
    const getIssuers = async () => {
      if (!currentPaymentMethod) return;

      try {
        // @ts-ignore - MercadoPago SDK
        const issuers = await window.MercadoPago.getIssuers({
          paymentMethodId: currentPaymentMethod
        });

        setIssuers(issuers || []);
        if (issuers && issuers.length > 0) {
          setFormData(prev => ({ ...prev, issuer: issuers[0].id }));
        }
        console.log('🏦 Issuers found:', issuers);
      } catch (error) {
        console.error('❌ Error getting issuers:', error);
      }
    };

    getIssuers();
  }, [currentPaymentMethod]);

  // Buscar parcelas quando emissor e método mudar
  useEffect(() => {
    const getInstallments = async () => {
      if (!currentPaymentMethod || !formData.issuer) return;

      try {
        // @ts-ignore - MercadoPago SDK
        const installments = await window.MercadoPago.getInstallments({
          amount: amount,
          locale: 'pt-BR',
          paymentMethodId: currentPaymentMethod,
          issuerId: formData.issuer
        });

        if (installments && installments[0]?.payer_costs) {
          setInstallments(installments[0].payer_costs);
          console.log('💰 Installments found:', installments[0].payer_costs);
        }
      } catch (error) {
        console.error('❌ Error getting installments:', error);
      }
    };

    getInstallments();
  }, [currentPaymentMethod, formData.issuer, amount]);

  // Validação do formulário
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (formData.cardNumber && !isValidCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    if (formData.cardholderName && formData.cardholderName.length < 2) {
      newErrors.cardholderName = 'Nome muito curto';
    }

    if (formData.expirationMonth && (parseInt(formData.expirationMonth) < 1 || parseInt(formData.expirationMonth) > 12)) {
      newErrors.expirationMonth = 'Mês inválido';
    }

    if (formData.expirationYear && parseInt(formData.expirationYear) < new Date().getFullYear()) {
      newErrors.expirationYear = 'Ano inválido';
    }

    if (formData.securityCode && (formData.securityCode.length < 3 || formData.securityCode.length > 4)) {
      newErrors.securityCode = 'CVV inválido';
    }

    if (formData.identificationNumber && !isValidCPF(formData.identificationNumber)) {
      newErrors.identificationNumber = 'CPF inválido';
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0 &&
                   formData.cardNumber.length > 0 &&
                   formData.cardholderName.length > 0 &&
                   formData.expirationMonth.length > 0 &&
                   formData.expirationYear.length > 0 &&
                   formData.securityCode.length > 0 &&
                   formData.identificationNumber.length > 0 &&
                   currentPaymentMethod.length > 0;

    setIsFormValid(isValid);
  }, [formData, currentPaymentMethod]);

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'identificationNumber':
        formattedValue = formatCPF(value.replace(/\D/g, ''));
        break;
      case 'expirationMonth':
      case 'expirationYear':
      case 'securityCode':
        formattedValue = value.replace(/\D/g, '');
        break;
      case 'cardholderName':
        formattedValue = value.toUpperCase();
        break;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;

    try {
      // Criar token do cartão
      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName,
        cardExpirationMonth: formData.expirationMonth,
        cardExpirationYear: formData.expirationYear,
        securityCode: formData.securityCode,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.replace(/\D/g, ''),
      };

      console.log('🔒 Creating card token...');

      // @ts-ignore - MercadoPago SDK
      const response = await window.MercadoPago.fields.createCardToken(cardData);

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao processar cartão');
      }

      // Preparar dados do pagamento
      const paymentData = {
        paymentMethod: 'credit_card',
        token: response.id,
        installments: parseInt(formData.installments),
        issuer_id: formData.issuer,
        payerInfo: {
          email: user?.email || `user-${user?.id}@dosecerta.online`,
          payment_method_id: currentPaymentMethod,
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber.replace(/\D/g, '')
          }
        }
      };

      console.log('💳 Card token created, processing payment...');
      await onPaymentCreate(paymentData);

    } catch (error) {
      console.error('❌ Card payment error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Erro ao processar pagamento' });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <div className="relative">
                <Input
                  ref={cardNumberRef}
                  id="cardNumber"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  maxLength={19}
                  className={errors.cardNumber ? 'border-red-500' : ''}
                />
                <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="col-span-2">
              <Label htmlFor="cardholderName">Nome no cartão</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="NOME COMO NO CARTÃO"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={errors.cardholderName ? 'border-red-500' : ''}
              />
              {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
            </div>

            <div>
              <Label htmlFor="expirationMonth">Mês</Label>
              <Select value={formData.expirationMonth} onValueChange={(value) => handleInputChange('expirationMonth', value)}>
                <SelectTrigger className={errors.expirationMonth ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expirationMonth && <p className="text-red-500 text-sm mt-1">{errors.expirationMonth}</p>}
            </div>

            <div>
              <Label htmlFor="expirationYear">Ano</Label>
              <Select value={formData.expirationYear} onValueChange={(value) => handleInputChange('expirationYear', value)}>
                <SelectTrigger className={errors.expirationYear ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.expirationYear && <p className="text-red-500 text-sm mt-1">{errors.expirationYear}</p>}
            </div>

            <div>
              <Label htmlFor="securityCode">CVV</Label>
              <Input
                id="securityCode"
                type="text"
                placeholder="123"
                value={formData.securityCode}
                onChange={(e) => handleInputChange('securityCode', e.target.value)}
                maxLength={4}
                className={errors.securityCode ? 'border-red-500' : ''}
              />
              {errors.securityCode && <p className="text-red-500 text-sm mt-1">{errors.securityCode}</p>}
            </div>

            <div>
              <Label htmlFor="identificationNumber">CPF</Label>
              <Input
                id="identificationNumber"
                type="text"
                placeholder="000.000.000-00"
                value={formData.identificationNumber}
                onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                maxLength={14}
                className={errors.identificationNumber ? 'border-red-500' : ''}
              />
              {errors.identificationNumber && <p className="text-red-500 text-sm mt-1">{errors.identificationNumber}</p>}
            </div>

            {installments.length > 0 && (
              <div className="col-span-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Select value={formData.installments} onValueChange={(value) => handleInputChange('installments', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {installments.map((installment) => (
                      <SelectItem key={installment.installments} value={installment.installments.toString()}>
                        {installment.installments}x de R$ {installment.installment_amount.toFixed(2).replace('.', ',')}
                        {installment.installment_rate > 0 && ` (Total: R$ ${installment.total_amount.toFixed(2).replace('.', ',')})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar R$ {amount.toFixed(2).replace('.', ',')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CardPaymentForm;
