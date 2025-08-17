import React from 'react';
import PaymentMigrationToggle from './PaymentMigrationToggle';

interface UnifiedPaymentButtonProps {
  planType: 'professional' | 'annual' | 'test';
  planName: string;
  planPrice: string;
  planPeriod: string;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  // Feature flags for testing
  forceTransparent?: boolean;
  forceClassic?: boolean;
}

const UnifiedPaymentButton: React.FC<UnifiedPaymentButtonProps> = (props) => {
  // Use new migration toggle component that handles both modes
  return <PaymentMigrationToggle {...props} />;
};

export default UnifiedPaymentButton; 
