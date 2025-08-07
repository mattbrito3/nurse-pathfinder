import { Preference, Payment, MercadoPagoConfig } from "mercadopago";

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string;
  transaction_amount: number;
  payer: {
    email: string;
  };
}

// Instância do cliente Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN as string,
});

class MercadoPagoService {
  private preference: Preference;
  private payment: Payment;

  constructor() {
    this.preference = new Preference(mpClient);
    this.payment = new Payment(mpClient);
    
    // Debug: Log token (only first 10 characters for security)
    console.log('🔑 MercadoPago Token loaded:', import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN ? `${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🌍 Environment:', import.meta.env.VITE_ENVIRONMENT || 'development');
    console.log('🌐 App URL:', import.meta.env.VITE_APP_URL || 'NOT FOUND');
  }

  /**
   * Create a payment preference for checkout
   */
  async createPreference(userId: string, planName: string, amount: number): Promise<MercadoPagoPreference> {
    try {
      const preferenceData = {
        external_reference: userId,
        metadata: {
          userId,
          planName,
        },
        items: [
          {
            id: `plano-${planName.toLowerCase()}`,
            title: `Plano ${planName} - DoseCerta`,
            description: `Assinatura do plano ${planName}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
            category_id: 'education', // Categoria educação
          }
        ],
        payment_methods: {
          installments: 12, // Número máximo de parcelas
        },
        auto_return: 'approved',
        back_urls: {
          success: `${import.meta.env.VITE_APP_URL}/pricing?payment=success`,
          failure: `${import.meta.env.VITE_APP_URL}/pricing?payment=failure`,
          pending: `${import.meta.env.VITE_APP_URL}/pricing?payment=pending`
        },
        notification_url: `${
          import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
            ? `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}`
            : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
        }/mercadopago-webhook-public`,
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };

      console.log('📤 MercadoPago Preference Data:', JSON.stringify(preferenceData, null, 2));

      const createdPreference = await this.preference.create({
        body: preferenceData
      });

      console.log('📡 MercadoPago API Response:', createdPreference);

      if (!createdPreference.id) {
        throw new Error('No preference ID returned');
      }

      return {
        id: createdPreference.id,
        init_point: createdPreference.init_point,
        sandbox_init_point: createdPreference.sandbox_init_point
      };
    } catch (error) {
      console.error('❌ Error creating MercadoPago preference:', error);
      throw error;
    }
  }

  /**
   * Get payment information
   */
  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    try {
      const paymentData = await this.payment.get({ id: paymentId });
      
      return {
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference,
        transaction_amount: paymentData.transaction_amount,
        payer: {
          email: paymentData.payer?.email || ''
        }
      };
    } catch (error) {
      console.error('❌ Error getting payment:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(userId: string, planName: string, amount: number): Promise<any> {
    try {
      const subscription = {
        reason: `Plano ${planName} - DoseCerta`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'BRL'
        },
        back_url: `${import.meta.env.VITE_APP_URL}/pricing?subscription=success`,
        external_reference: userId
      };

      const response = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription information
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      throw error;
    }
  }
}

export const mercadopagoService = new MercadoPagoService(); 