/**
 * 🧮 CALCULATOR USAGE LIMITS HOOK
 * Gerencia limites de uso da calculadora baseado no plano
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface CalculatorUsage {
  daily_calculations: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

interface CalculatorLimits {
  maxDailyCalculations: number;
  allowedFeatures: ('dosage' | 'infusion' | 'conversion' | 'concentration')[];
  hasHistoryAccess: boolean;
  hasPremiumFeatures: boolean;
}

export const useCalculatorLimits = () => {
  const { user } = useAuth();
  const { hasPremiumAccess, planLimits, subscriptionLoading } = useSubscription();
  const [usage, setUsage] = useState<CalculatorUsage | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);



  // Definir limites baseado no plano
  const getCalculatorLimits = (): CalculatorLimits => {
    if (hasPremiumAccess) {
      // Planos pagos: acesso completo
      return {
        maxDailyCalculations: 999, // Ilimitado na prática
        allowedFeatures: ['dosage', 'infusion', 'conversion', 'concentration'],
        hasHistoryAccess: true,
        hasPremiumFeatures: true
      };
    } else {
      // Plano gratuito: apenas dosagem, 7 usos por dia, sem histórico
      return {
        maxDailyCalculations: 7,
        allowedFeatures: ['dosage'], // Apenas dosagem por peso
        hasHistoryAccess: false,
        hasPremiumFeatures: false
      };
    }
  };

  // Carregar uso atual do usuário
  const loadUsage = async () => {
    if (!user?.id) {
      // Usuário não logado - usar localStorage para rastreamento básico
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `calculator_usage_${today}`;
      const localUsage = localStorage.getItem(storageKey);
      
      if (localUsage) {
        const parsed = JSON.parse(localUsage);
        setUsage({
          daily_calculations: parsed.count || 0,
          last_reset_date: today,
          created_at: today,
          updated_at: today
        });
      } else {
        setUsage({
          daily_calculations: 0,
          last_reset_date: today,
          created_at: today,
          updated_at: today
        });
      }
      setIsLoadingUsage(false);
      return;
    }

    // Por enquanto, usar sempre localStorage até a migração ser aplicada
    await loadUsageFromLocalStorage();
  };

  // Fallback para localStorage
  const loadUsageFromLocalStorage = async () => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `calculator_usage_${user?.id || 'anonymous'}_${today}`;
    const localUsage = localStorage.getItem(storageKey);
    
    if (localUsage) {
      const parsed = JSON.parse(localUsage);
      setUsage({
        daily_calculations: parsed.count || 0,
        last_reset_date: today,
        created_at: today,
        updated_at: today
      });
    } else {
      setUsage({
        daily_calculations: 0,
        last_reset_date: today,
        created_at: today,
        updated_at: today
      });
    }
    setIsLoadingUsage(false);
  };

  // Incrementar uso
  const incrementUsage = async (): Promise<boolean> => {
    const limits = getCalculatorLimits();
    
    if (!usage) return false;
    
    // Verificar se já atingiu o limite
    if (usage.daily_calculations >= limits.maxDailyCalculations) {
      return false;
    }

    const newCount = usage.daily_calculations + 1;
    const today = new Date().toISOString().split('T')[0];

    // Salvar no localStorage (por enquanto)
    const storageKey = `calculator_usage_${user?.id || 'anonymous'}_${today}`;
    localStorage.setItem(storageKey, JSON.stringify({ count: newCount }));

    // Atualizar estado local
    setUsage(prev => prev ? {
      ...prev,
      daily_calculations: newCount,
      updated_at: new Date().toISOString()
    } : null);

    return true;
  };

  // Verificar se pode usar uma feature específica
  const canUseFeature = (feature: 'dosage' | 'infusion' | 'conversion' | 'concentration' | 'history'): boolean => {
    const limits = getCalculatorLimits();
    
    if (feature === 'history') {
      return limits.hasHistoryAccess;
    }
    
    return limits.allowedFeatures.includes(feature as any);
  };

  // Verificar se pode fazer mais cálculos
  const canCalculate = (): boolean => {
    const limits = getCalculatorLimits();
    
    if (!usage) return false;
    
    return usage.daily_calculations < limits.maxDailyCalculations;
  };

  // Obter uso restante
  const getRemainingUsage = (): number => {
    const limits = getCalculatorLimits();
    
    if (!usage) return limits.maxDailyCalculations;
    
    return Math.max(0, limits.maxDailyCalculations - usage.daily_calculations);
  };

  // Reset diário automático
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (usage && usage.last_reset_date !== today) {
      // Novo dia - resetar contador
      loadUsage();
    }
  }, [usage?.last_reset_date]);

  // Carregar uso inicial
  useEffect(() => {
    loadUsage();
  }, [user?.id, hasPremiumAccess]);

  const limits = getCalculatorLimits();

  return {
    // Estado
    usage,
    limits,
    isLoading: isLoadingUsage,
    
    // Verificações
    canUseFeature,
    canCalculate,
    getRemainingUsage,
    
    // Ações
    incrementUsage,
    
    // Informações úteis
    isFreePlan: !hasPremiumAccess,
    usagePercentage: usage ? (usage.daily_calculations / limits.maxDailyCalculations) * 100 : 0
  };
};