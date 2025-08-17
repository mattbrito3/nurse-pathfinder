import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, QrCode, AlertCircle, User, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';

interface PixPaymentFormProps {
  onPaymentCreate: (paymentData: any) => Promise<any>;
  isLoading: boolean;
  amount: number;
}

interface PixFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const PixPaymentForm: React.FC<PixPaymentFormProps> = ({
  onPaymentCreate,
  isLoading,
  amount
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PixFormData>({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validação de email simples
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação do formulário
  React.useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName && formData.firstName.length < 2) {
      newErrors.firstName = 'Nome muito curto';
    }

    if (formData.lastName && formData.lastName.length < 2) {
      newErrors.lastName = 'Sobrenome muito curto';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0 &&
                   formData.firstName.length > 1 &&
                   formData.lastName.length > 1 &&
                   formData.email.length > 0;

    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (field: keyof PixFormData, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'firstName':
      case 'lastName':
        // Capitalizar primeira letra de cada palavra
        formattedValue = value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      case 'email':
        formattedValue = value.toLowerCase();
        break;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;

    try {
      // Preparar dados do pagamento PIX
      const paymentData = {
        paymentMethod: 'pix',
        payerInfo: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      };

      console.log('🔒 Creating PIX payment...');
      await onPaymentCreate(paymentData);

    } catch (error) {
      console.error('❌ PIX payment error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Erro ao processar pagamento' });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <QrCode className="h-12 w-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Pagamento PIX</h3>
          <p className="text-sm text-muted-foreground">
            Pague instantaneamente com PIX
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="João"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Silva"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <QrCode className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">Como funciona:</p>
                <ul className="text-blue-600 mt-1 space-y-1">
                  <li>1. Clique em "Gerar PIX"</li>
                  <li>2. Escaneie o QR Code ou copie o código</li>
                  <li>3. Pague pelo app do seu banco</li>
                  <li>4. Aprovação instantânea!</li>
                </ul>
              </div>
            </div>
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
                Gerando PIX...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Gerar PIX - R$ {amount.toFixed(2).replace('.', ',')}
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Pagamento 100% seguro com PIX</p>
            <p>Processado pelo Mercado Pago</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PixPaymentForm;
