/**
 * 💳 SUBSCRIPTION MANAGEMENT HOOK
 * Complete subscription and payment management
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  isActive: boolean;
  planName?: string;
  planId?: number;
  status?: string;
  currentPeriodEnd?: string;
  isLoading: boolean;
  error?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isLoading: true
  });

  const checkSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscriptionStatus({
        isActive: false,
        isLoading: false
      });
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSubscriptionStatus({
          isActive: true,
          planName: data.subscription_plans?.name,
          planId: data.subscription_plan_id,
          status: data.status,
          currentPeriodEnd: data.current_period_end,
          isLoading: false
        });
      } else {
        setSubscriptionStatus({
          isActive: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setSubscriptionStatus({
        isActive: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [user?.id]);

  // Verificar assinatura na inicialização
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Função para polling de verificação de pagamento
  const startPaymentPolling = useCallback(async (
    onSuccess?: () => void,
    onTimeout?: () => void,
    maxAttempts = 60,
    pollInterval = 1000
  ) => {
    if (!user?.id) return;

    let attempts = 0;
    
    const poll = async () => {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Assinatura ativa encontrada
          await checkSubscription(); // Atualizar status
          if (onSuccess) {
            onSuccess();
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          if (onTimeout) {
            onTimeout();
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          if (onTimeout) {
            onTimeout();
          }
        }
      }
    };

    poll();
  }, [user?.id, checkSubscription]);

  return {
    ...subscriptionStatus,
    checkSubscription,
    startPaymentPolling
  };
};
