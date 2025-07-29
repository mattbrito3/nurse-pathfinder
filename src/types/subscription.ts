/**
 * 💳 SUBSCRIPTION & PAYMENT TYPES
 * Complete typing system for payment and subscription management
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
  maxFlashcards?: number;
  maxCalculations?: number;
  advancedAnalytics?: boolean;
  priority_support?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  subscription_plans?: {
    name: string;
    features: string[];
    max_flashcards?: number;
    max_calculations?: number;
    advanced_analytics?: boolean;
    priority_support?: boolean;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  client_secret: string;
}

export interface BillingPortalSession {
  url: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  success_url: string;
  cancel_url: string;
}

export type PaymentStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PaymentError {
  message: string;
  code?: string;
  type?: string;
}