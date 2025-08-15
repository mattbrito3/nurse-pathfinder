/**
 * 💳 SUBSCRIPTION MANAGEMENT HOOK
 * Complete subscription and payment management
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log('🚫 useSubscription: No user ID, setting inactive');
      setSubscriptionStatus({
        isActive: false,
        isLoading: false
      });
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      console.log('🔍 useSubscription: Checking subscription for user:', user.id);

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

      console.log('📊 useSubscription: Query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log('✅ useSubscription: Active subscription found:', {
          planName: data.subscription_plans?.name,
          planId: data.subscription_plan_id,
          status: data.status
        });
        
        // Toast visual em produção
        toast.success(`🎉 Assinatura ativa: ${data.subscription_plans?.name}`, {
          description: `Status: ${data.status}`,
          duration: 3000
        });
        
        setSubscriptionStatus({
          isActive: true,
          planName: data.subscription_plans?.name,
          planId: data.subscription_plan_id,
          status: data.status,
          currentPeriodEnd: data.current_period_end,
          isLoading: false
        });
      } else {
        console.log('❌ useSubscription: No active subscription found');
        
        // Toast visual para debug em produção
        toast.info('🔍 Verificando assinatura...', {
          description: 'Nenhuma assinatura ativa encontrada',
          duration: 2000
        });
        
        setSubscriptionStatus({
          isActive: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ useSubscription: Error checking subscription:', error);
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
