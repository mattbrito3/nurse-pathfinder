/**
 * Serviço para Checkout Transparente do Mercado Pago
 * Substitui o mercadopagoService.ts para pagamentos diretos na página
 */

export interface TransparentPaymentRequest {
  userId: string;
  planName: string;
  amount: number;
  paymentMethod: 'credit_card' | 'pix' | 'bolbancario';
  token?: string; // Para cartão
  payerInfo: {
    email: string;
    first_name?: string;
    last_name?: string;
    payment_method_id?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  installments?: number;
  issuer_id?: string;
}

export interface TransparentPaymentResponse {
  payment_id: string;
  status: string;
  external_reference: string;
  payment_method: string;
  transaction_amount: number;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  boleto_url?: string;
  installments?: number;
  payment_method_id?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  status: string;
  status_detail?: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  boleto_url?: string;
  installments?: number;
  card?: {
    first_six_digits: string;
    last_four_digits: string;
    cardholder_name?: string;
  };
}

class TransparentPaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
                   `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    
    console.log('🔧 TransparentPaymentService initialized');
    console.log('🌐 Base URL:', this.baseUrl);
  }

  /**
   * Criar pagamento transparente
   */
  async createPayment(request: TransparentPaymentRequest): Promise<TransparentPaymentResponse> {
    try {
      console.log('💳 Creating transparent payment:', request);

      const response = await fetch(`${this.baseUrl}/create-transparent-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment created successfully:', result);

      return result;
    } catch (error) {
      console.error('❌ Error creating transparent payment:', error);
      throw error;
    }
  }

  /**
   * Consultar status do pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      console.log('🔍 Getting payment status for:', paymentId);

      const response = await fetch(`${this.baseUrl}/get-payment-status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment status retrieved:', result);

      return result;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Polling de status do pagamento
   * Útil para aguardar aprovação de PIX ou outros métodos assíncronos
   */
  async pollPaymentStatus(
    paymentId: string, 
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onUpdate?: (status: PaymentStatusResponse) => void;
    } = {}
  ): Promise<PaymentStatusResponse> {
    const {
      maxAttempts = 60, // 3 minutos com intervalo de 3s
      intervalMs = 3000,
      onUpdate
    } = options;

    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getPaymentStatus(paymentId);

          if (onUpdate) {
            onUpdate(status);
          }

          // Status finais
          if (status.status === 'approved' || status.status === 'rejected' || status.status === 'cancelled') {
            resolve(status);
            return;
          }

          // Continuar polling se não atingiu limite
          if (attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
          } else {
            reject(new Error('Timeout: Payment status polling exceeded maximum attempts'));
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
          } else {
            reject(error);
          }
        }
      };

      poll();
    });
  }

  /**
   * Criar pagamento com cartão
   */
  async createCardPayment(
    userId: string,
    planName: string,
    amount: number,
    cardToken: string,
    payerInfo: {
      email: string;
      payment_method_id: string;
      identification: {
        type: string;
        number: string;
      };
    },
    installments: number = 1,
    issuer_id?: string
  ): Promise<TransparentPaymentResponse> {
    return this.createPayment({
      userId,
      planName,
      amount,
      paymentMethod: 'credit_card',
      token: cardToken,
      payerInfo,
      installments,
      issuer_id
    });
  }

  /**
   * Criar pagamento PIX
   */
  async createPixPayment(
    userId: string,
    planName: string,
    amount: number,
    payerInfo: {
      email: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<TransparentPaymentResponse> {
    return this.createPayment({
      userId,
      planName,
      amount,
      paymentMethod: 'pix',
      payerInfo
    });
  }

  /**
   * Criar pagamento com boleto
   */
  async createBoletoPayment(
    userId: string,
    planName: string,
    amount: number,
    payerInfo: {
      email: string;
      first_name: string;
      last_name: string;
      identification: {
        type: string;
        number: string;
      };
    }
  ): Promise<TransparentPaymentResponse> {
    return this.createPayment({
      userId,
      planName,
      amount,
      paymentMethod: 'bolbancario',
      payerInfo
    });
  }

  /**
   * Validar configuração do serviço
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY) {
      errors.push('VITE_MERCADOPAGO_PUBLIC_KEY não configurada');
    }

    if (!this.baseUrl) {
      errors.push('Base URL das functions não configurada');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const transparentPaymentService = new TransparentPaymentService();
