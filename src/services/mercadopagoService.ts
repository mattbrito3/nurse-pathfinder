import { supabase } from '@/integrations/supabase/client';

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

class MercadoPagoService {
  private baseUrl = 'https://api.mercadopago.com';
  private accessToken: string;
  private isTestMode = true; // Force test mode

  constructor() {
    // Use environment variable
    this.accessToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || '';
    
    // Debug: Log token (only first 10 characters for security)
    console.log('🔑 MercadoPago Token loaded:', this.accessToken ? `${this.accessToken.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🌍 Environment:', import.meta.env.VITE_ENVIRONMENT || 'development');
    
    if (!this.accessToken) {
      console.error('❌ VITE_MERCADOPAGO_ACCESS_TOKEN não encontrado!');
    }
  }

  /**
   * Create a payment preference for checkout
   */
  async createPreference(userId: string, planName: string, amount: number): Promise<MercadoPagoPreference> {
    try {
             const preference = {
         items: [
           {
             title: `Plano ${planName} - DoseCerta`,
             unit_price: amount,
             quantity: 1,
             currency_id: 'BRL'
           }
         ],
         external_reference: userId,
         back_urls: {
           success: `${import.meta.env.VITE_APP_URL}/pricing?payment=success`,
           failure: `${import.meta.env.VITE_APP_URL}/pricing?payment=failure`,
           pending: `${import.meta.env.VITE_APP_URL}/pricing?payment=pending`
         },
         auto_return: 'approved',
         notification_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook`,
         expires: true,
         expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
       };

       console.log('📤 MercadoPago Preference Data:', JSON.stringify(preference, null, 2));

      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      console.log('📡 MercadoPago API Response Status:', response.status);
      console.log('📡 MercadoPago API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ MercadoPago API Error Response:', errorData);
        throw new Error(`MercadoPago API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data;
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
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.status}`);
      }

      return await response.json();
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

      const response = await fetch(`${this.baseUrl}/preapproval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
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
      const response = await fetch(`${this.baseUrl}/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
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
      const response = await fetch(`${this.baseUrl}/preapproval/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
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