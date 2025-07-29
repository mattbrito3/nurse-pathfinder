/**
 * 💳 SUBSCRIPTION MANAGEMENT HOOK
 * Complete subscription and payment management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  PaymentStatus,
  BillingPortalSession 
} from '@/types/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  // Get available subscription plans
  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      return (data as any[]).map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
      }));
    }
  });

  // Get user's current subscription
  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select(`
          *,
          subscription_plans (
            name,
            features,
            max_flashcards,
            max_calculations,
            advanced_analytics,
            priority_support
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    enabled: !!user?.id
  });

  // Get user's payment history
  const {
    data: paymentHistory = [],
    isLoading: historyLoading
  } = useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_history' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id
  });

  // Check if user has premium features
  const hasPremiumAccess = () => {
    if (!currentSubscription) return false;
    
    return currentSubscription.status === 'active' && 
           new Date(currentSubscription.current_period_end) > new Date();
  };

  // Get user's plan limits
  const getPlanLimits = () => {
    if (!currentSubscription?.subscription_plans) {
      // Free plan defaults
      return {
        maxFlashcards: 50,
        maxCalculations: 100,
        advancedAnalytics: false,
        prioritySupport: false
      };
    }

    const plan = currentSubscription.subscription_plans;
    return {
      maxFlashcards: plan.max_flashcards || null, // null = unlimited
      maxCalculations: plan.max_calculations || null,
      advancedAnalytics: plan.advanced_analytics || false,
      prioritySupport: plan.priority_support || false
    };
  };

  // Create billing portal session
  const createBillingPortalSession = useMutation({
    mutationFn: async (): Promise<BillingPortalSession> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!(currentSubscription as any)?.stripe_customer_id) {
        throw new Error('No active subscription found');
      }

      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
        body: { 
          customerId: (currentSubscription as any).stripe_customer_id,
          returnUrl: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Billing Portal
      window.location.href = data.url;
    },
    onError: (error: any) => {
      console.error('Billing portal error:', error);
      toast.error('Erro ao acessar portal de cobrança', {
        description: error.message || 'Tente novamente'
      });
    }
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentSubscription?.stripe_subscription_id) {
        throw new Error('No active subscription found');
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { 
          subscriptionId: currentSubscription.stripe_subscription_id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Assinatura cancelada', {
        description: 'Você manterá acesso até o final do período pago'
      });
    },
    onError: (error: any) => {
      console.error('Cancel subscription error:', error);
      toast.error('Erro ao cancelar assinatura', {
        description: error.message || 'Tente novamente'
      });
    }
  });

  // Get popular plan
  const getPopularPlan = () => {
    return plans.find(plan => plan.popular) || plans[1]; // Default to second plan
  };

  // Format price
  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Get subscription status text
  const getSubscriptionStatusText = (status: string) => {
    const statusMap = {
      'active': 'Ativa',
      'canceled': 'Cancelada',
      'past_due': 'Pagamento em atraso',
      'trialing': 'Período de teste',
      'incomplete': 'Pagamento pendente'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return {
    // Data
    plans,
    currentSubscription,
    paymentHistory,
    paymentStatus,
    
    // Loading states
    plansLoading,
    subscriptionLoading,
    historyLoading,
    isCreatingBillingPortal: createBillingPortalSession.isPending,
    isCanceling: cancelSubscription.isPending,
    
    // Computed values
    hasPremiumAccess: hasPremiumAccess(),
    planLimits: getPlanLimits(),
    popularPlan: getPopularPlan(),
    
    // Actions
    manageBilling: createBillingPortalSession.mutate,
    cancelSubscription: cancelSubscription.mutate,
    
    // Utilities
    formatPrice,
    getSubscriptionStatusText,
    
    // Errors
    plansError,
    subscriptionError
  };
};