import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

export interface PriceInfo {
  productId: string;
  priceId: string;
  amount: number;
  interval: 'month' | 'year';
}

// Price mapping for your products
export const STRIPE_PRICES: Record<string, PriceInfo> = {
  professional: {
    productId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRODUCT_ID,
    priceId: '', // Will be fetched from Stripe
    amount: 1990, // R$ 19,90 in cents
    interval: 'month'
  },
  annual: {
    productId: import.meta.env.VITE_STRIPE_ANNUAL_PRODUCT_ID,
    priceId: '', // Will be fetched from Stripe
    amount: 19900, // R$ 199,00 in cents
    interval: 'year'
  }
};

export const createCheckoutSession = async (
  planType: 'professional' | 'annual',
  userId: string
): Promise<CheckoutSessionData> => {
  try {
    console.log('🚀 Creating checkout session for plan:', planType);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planType,
        userId,
        successUrl: `${window.location.origin}/pricing?payment=success`,
        cancelUrl: `${window.location.origin}/pricing?payment=canceled`,
      },
    });

    if (error) {
      console.error('❌ Checkout session error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }

    console.log('✅ Checkout session created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error);
    throw new Error(`Checkout failed: ${error.message}`);
  }
};

export const redirectToCheckout = async (sessionId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    console.log('🔄 Redirecting to checkout:', sessionId);
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('❌ Checkout redirect error:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Redirect error:', error);
    throw new Error(`Redirect failed: ${error.message}`);
  }
};

export const createBillingPortalSession = async (customerId: string): Promise<{ url: string }> => {
  try {
    console.log('🏢 Creating billing portal session');
    
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: {
        customerId,
        returnUrl: `${window.location.origin}/pricing`,
      },
    });

    if (error) {
      console.error('❌ Billing portal error:', error);
      throw new Error(`Failed to create billing portal: ${error.message}`);
    }

    console.log('✅ Billing portal created:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Billing portal error:', error);
    throw new Error(`Billing portal failed: ${error.message}`);
  }
};

export const handleSubscriptionFlow = async (
  planType: 'professional' | 'annual',
  userId: string
) => {
  try {
    console.log('💳 Starting subscription flow for:', planType);
    
    // Create checkout session
    const session = await createCheckoutSession(planType, userId);
    
    // Redirect to Stripe Checkout
    await redirectToCheckout(session.sessionId);
    
  } catch (error: any) {
    console.error('❌ Subscription flow error:', error);
    throw error;
  }
};

// Development fallback - simulate Stripe checkout
export const simulateCheckout = async (
  planType: 'professional' | 'annual',
  userId: string
) => {
  console.log('🧪 SIMULATING STRIPE CHECKOUT (Development Mode)');
  console.log('👤 User ID:', userId);
  console.log('💰 Plan:', planType);
  console.log('💳 Amount:', planType === 'professional' ? 'R$ 19,90/mês' : 'R$ 199,00/ano');
  console.log('');
  console.log('🚀 In production, this would redirect to Stripe Checkout');
  console.log('💡 Edge Functions need to be deployed for real payments');
  
  // Simulate success after 2 seconds
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Simulated payment success!');
      resolve({ success: true, sessionId: 'sim_checkout_' + Date.now() });
    }, 2000);
  });
};

export default {
  createCheckoutSession,
  redirectToCheckout,
  createBillingPortalSession,
  handleSubscriptionFlow,
  simulateCheckout,
  STRIPE_PRICES
};