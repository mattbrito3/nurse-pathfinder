import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PaymentStatusBannerProps {
  status: 'checking' | 'success' | 'pending' | 'error';
  message?: string;
  className?: string;
}

const PaymentStatusBanner: React.FC<PaymentStatusBannerProps> = ({
  status,
  message,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          text: message || 'Verificando status do pagamento...',
          bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          icon: CheckCircle,
          text: message || 'Pagamento confirmado!',
          bgColor: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          icon: Clock,
          text: message || 'Aguardando confirmação do pagamento PIX...',
          bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: message || 'Erro no processamento do pagamento',
          bgColor: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: Loader2,
          text: 'Verificando...',
          bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`border-b ${config.bgColor} ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <IconComponent 
            className={`h-5 w-5 ${status === 'checking' ? 'animate-spin' : ''} ${config.iconColor}`} 
          />
          <span className={`font-medium ${config.textColor}`}>
            {config.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusBanner;
