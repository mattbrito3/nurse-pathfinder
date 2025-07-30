import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, Mail, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface CustomerData {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
}

interface CustomerDataFormProps {
  planName: string;
  planPrice: string;
  planPeriod: string;
  onSubmit: (customerData: CustomerData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const CustomerDataForm: React.FC<CustomerDataFormProps> = ({
  planName,
  planPrice,
  planPeriod,
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    cellphone: '',
    email: '',
    taxId: ''
  });

  const [errors, setErrors] = useState<Partial<CustomerData>>({});

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cellphone.trim()) {
      newErrors.cellphone = 'Celular é obrigatório';
    } else if (formData.cellphone.replace(/\D/g, '').length < 10) {
      newErrors.cellphone = 'Celular inválido';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'CPF é obrigatório';
    } else if (formData.taxId.replace(/\D/g, '').length !== 11) {
      newErrors.taxId = 'CPF deve ter 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    // Limpar formatação antes de enviar
    const cleanData: CustomerData = {
      ...formData,
      cellphone: formData.cellphone.replace(/\D/g, ''),
      taxId: formData.taxId.replace(/\D/g, '')
    };

    onSubmit(cleanData);
  };

  return (
    <Card className="border-green-200">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Dados para Pagamento PIX</CardTitle>
        <CardDescription>
          Precisamos de alguns dados para gerar seu QR Code PIX
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo do Plano */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{planName}</p>
              <p className="text-sm text-muted-foreground">Pagamento via PIX</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{planPrice}</p>
              <p className="text-sm text-muted-foreground">{planPeriod}</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="cellphone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Celular
            </Label>
            <Input
              id="cellphone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.cellphone}
              onChange={(e) => handleInputChange('cellphone', formatPhone(e.target.value))}
              className={errors.cellphone ? 'border-red-500' : ''}
              maxLength={15}
            />
            {errors.cellphone && <p className="text-sm text-red-500 mt-1">{errors.cellphone}</p>}
          </div>

          <div>
            <Label htmlFor="taxId" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CPF
            </Label>
            <Input
              id="taxId"
              type="text"
              placeholder="123.456.789-01"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', formatCPF(e.target.value))}
              className={errors.taxId ? 'border-red-500' : ''}
              maxLength={14}
            />
            {errors.taxId && <p className="text-sm text-red-500 mt-1">{errors.taxId}</p>}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Gerando PIX...' : 'Gerar PIX'}
            </Button>
          </div>
        </form>

        {/* Informações de Segurança */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>🔒 Seus dados estão seguros e são usados apenas para processar o pagamento</p>
          <p>✅ Processamento via AbacatePay - Gateway oficial PIX</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDataForm;