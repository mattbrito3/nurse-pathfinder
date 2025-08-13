import React from 'react';
import MercadoPagoButton from './MercadoPagoButton';

interface UnifiedPaymentButtonProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const UnifiedPaymentButton: React.FC<UnifiedPaymentButtonProps> = (props) => {
  // Use MercadoPago button for now
  return <MercadoPagoButton {...props} />;
};

export default UnifiedPaymentButton; 
