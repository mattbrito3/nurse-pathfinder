import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SimpleCheckoutProps {
  planType: 'professional' | 'annual';
  planName: string;
  planPrice: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SimpleCheckout: React.FC<SimpleCheckoutProps> = ({
  planType,
  planName,
  planPrice,
  onClose,
  onSuccess
}) => {
  console.log('🎨 SIMPLECHECK RENDERIZANDO:', { planType, planName, planPrice });

  const handlePay = () => {
    console.log('💳 SIMULANDO PAGAMENTO...');
    setTimeout(() => {
      console.log('✅ PAGAMENTO SIMULADO CONCLUÍDO');
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Checkout Teste</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{planName}</h3>
            <p className="text-2xl font-bold text-blue-600">{planPrice}</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm">💳 Número: 4242 4242 4242 4242</p>
            <p className="text-sm">📅 Validade: 12/28</p>
            <p className="text-sm">🔒 CVC: 123</p>
          </div>
          
          <Button 
            onClick={handlePay}
            className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Pagar {planPrice} (TESTE)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleCheckout;