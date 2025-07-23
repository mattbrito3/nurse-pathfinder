import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { CalculationHistory, CalculationType } from '@/types/calculator';

const STORAGE_KEY_PREFIX = 'medication_calculation_history';
const MAX_HISTORY_ITEMS = 50; // Limitar histórico para performance

export const useCalculationHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Criar chave específica do usuário
  const getStorageKey = () => {
    if (user?.id) {
      return `${STORAGE_KEY_PREFIX}_${user.id}`;
    }
    // Fallback para usuário anônimo (sessão)
    return `${STORAGE_KEY_PREFIX}_anonymous_${getOrCreateSessionId()}`;
  };

  // Criar ID de sessão para usuários não logados
  const getOrCreateSessionId = () => {
    let sessionId = sessionStorage.getItem('calculation_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('calculation_session_id', sessionId);
    }
    return sessionId;
  };

  // Migrar histórico antigo se necessário
  const migrateOldHistory = () => {
    try {
      const oldKey = 'medication_calculation_history';
      const oldHistory = localStorage.getItem(oldKey);
      
      if (oldHistory && user?.id) {
        const newKey = getStorageKey();
        const existingHistory = localStorage.getItem(newKey);
        
        // Se não existe histórico para o usuário atual, migrar o antigo
        if (!existingHistory) {
          localStorage.setItem(newKey, oldHistory);
          console.log('Histórico migrado para o usuário:', user.id);
        }
        
        // Remover histórico antigo após migração
        localStorage.removeItem(oldKey);
      }
    } catch (error) {
      console.error('Erro ao migrar histórico:', error);
    }
  };

  // Carregar histórico do localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        // Migrar histórico antigo se necessário
        migrateOldHistory();
        
        const storageKey = getStorageKey();
        const savedHistory = localStorage.getItem(storageKey);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          // Converter strings de data de volta para objetos Date
          const historyWithDates = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setHistory(historyWithDates);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user?.id]); // Recarregar quando o usuário mudar

  // Salvar histórico no localStorage
  const saveToStorage = (newHistory: CalculationHistory[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  // Adicionar novo cálculo ao histórico
  const addCalculation = (
    type: CalculationType,
    calculation: any,
    medicationName?: string
  ) => {
    const newItem: CalculationHistory = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      calculation,
      timestamp: new Date(),
      isFavorite: false,
      medicationName: medicationName || 
        (calculation.medicationName) || 
        `${type.charAt(0).toUpperCase() + type.slice(1)}`
    };

    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(newHistory);
    saveToStorage(newHistory);
    
    return newItem.id;
  };

  // Alternar favorito
  const toggleFavorite = (id: string) => {
    const newHistory = history.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  // Remover cálculo
  const removeCalculation = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  // Limpar todo histórico
  const clearHistory = () => {
    setHistory([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  // Obter estatísticas
  const getStats = () => {
    const total = history.length;
    const favorites = history.filter(item => item.isFavorite).length;
    const byType = history.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = history.filter(item => 
      item.timestamp >= today
    ).length;

    return { total, favorites, byType, todayCount };
  };

  // Filtrar histórico
  const filterHistory = (
    type?: CalculationType,
    favoritesOnly?: boolean,
    searchTerm?: string
  ) => {
    return history.filter(item => {
      if (type && item.type !== type) return false;
      if (favoritesOnly && !item.isFavorite) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const medicationName = item.medicationName?.toLowerCase() || '';
        const calculationType = item.type.toLowerCase();
        return medicationName.includes(search) || calculationType.includes(search);
      }
      return true;
    });
  };

  // Exportar para texto (compartilhamento)
  const exportToText = (calculation: CalculationHistory): string => {
    const date = calculation.timestamp.toLocaleDateString('pt-BR');
    const time = calculation.timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', minute: '2-digit' 
    });

    let text = `💉 CÁLCULO MEDICAMENTOSO\n`;
    text += `🕐 ${date} - ${time}\n\n`;

    switch (calculation.type) {
      case 'dosage':
        const dosage = calculation.calculation;
        text += `${dosage.medicationName || 'Medicamento'} - ${dosage.patientWeight}kg paciente\n`;
        text += `Dose: ${dosage.prescribedDose}${dosage.prescribedUnit} → ${dosage.result?.volumeToAdminister}${dosage.result?.unit}\n`;
        text += `(${dosage.availableConcentration}${dosage.concentrationUnit} disponível)\n`;
        break;

      case 'infusion':
        const infusion = calculation.calculation;
        text += `Gotejamento: ${infusion.totalVolume}ml em ${infusion.totalTime}${infusion.timeUnit}\n`;
        text += `Resultado: ${infusion.result?.mlPerHour}ml/h`;
        if (infusion.equipmentType === 'macro') {
          text += ` | ${infusion.result?.dropsPerMinute} gotas/min`;
        } else if (infusion.equipmentType === 'micro') {
          text += ` | ${infusion.result?.microdropsPerMinute} microgotas/min`;
        }
        text += `\n`;
        break;

      case 'conversion':
        const conversion = calculation.calculation;
        text += `Conversão: ${conversion.value} ${conversion.fromUnit} = ${conversion.result?.convertedValue} ${conversion.toUnit}\n`;
        break;

      case 'concentration':
        const concentration = calculation.calculation;
        text += `Diluição: ${concentration.drugAmount}${concentration.drugUnit} em ${concentration.diluentVolume}ml\n`;
        text += `Concentração final: ${concentration.result?.finalConcentration}${concentration.result?.concentrationUnit}\n`;
        break;
    }

    if (calculation.calculation.result?.alerts?.length > 0) {
      text += `\n⚠️ Alertas: ${calculation.calculation.result.alerts.join(', ')}\n`;
    }

    text += `\n✅ Cálculo validado\n🔗 nurse-pathfinder.com`;
    
    return text;
  };

  // Exportar múltiplos cálculos para relatório
  const exportToReport = (calculations: CalculationHistory[]): string => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', minute: '2-digit' 
    });

    let report = `RELATÓRIO DE CÁLCULOS MEDICAMENTOSOS\n`;
    report += `Data: ${dateStr} - ${timeStr}\n`;
    report += `Total de cálculos: ${calculations.length}\n\n`;
    report += `═══════════════════════════════════════\n\n`;

    calculations.forEach((calc, index) => {
      const calcDate = calc.timestamp.toLocaleDateString('pt-BR');
      const calcTime = calc.timestamp.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', minute: '2-digit' 
      });

      report += `CÁLCULO #${index + 1} - ${calc.type.toUpperCase()}\n`;
      report += `Data: ${calcDate} - ${calcTime}\n`;
      
      if (calc.isFavorite) {
        report += `⭐ FAVORITO\n`;
      }

      switch (calc.type) {
        case 'dosage':
          const dosage = calc.calculation;
          report += `Medicamento: ${dosage.medicationName || 'N/A'}\n`;
          report += `Paciente: ${dosage.patientWeight}kg\n`;
          report += `Dose prescrita: ${dosage.prescribedDose}${dosage.prescribedUnit}\n`;
          report += `Concentração: ${dosage.availableConcentration}${dosage.concentrationUnit}\n`;
          report += `Resultado: ${dosage.result?.volumeToAdminister}${dosage.result?.unit}\n`;
          break;

        case 'infusion':
          const infusion = calc.calculation;
          report += `Volume: ${infusion.totalVolume}ml\n`;
          report += `Tempo: ${infusion.totalTime}${infusion.timeUnit}\n`;
          report += `Equipo: ${infusion.equipmentType}\n`;
          report += `Resultado: ${infusion.result?.mlPerHour}ml/h`;
          if (infusion.equipmentType !== 'bomba') {
            const drops = infusion.equipmentType === 'macro' 
              ? infusion.result?.dropsPerMinute 
              : infusion.result?.microdropsPerMinute;
            const unit = infusion.equipmentType === 'macro' ? 'gotas/min' : 'microgotas/min';
            report += ` | ${drops} ${unit}`;
          }
          report += `\n`;
          break;

        case 'conversion':
          const conversion = calc.calculation;
          report += `De: ${conversion.value} ${conversion.fromUnit}\n`;
          report += `Para: ${conversion.result?.convertedValue} ${conversion.toUnit}\n`;
          break;

        case 'concentration':
          const concentration = calc.calculation;
          report += `Medicamento: ${concentration.drugAmount}${concentration.drugUnit}\n`;
          report += `Diluente: ${concentration.diluentVolume}ml\n`;
          report += `Concentração final: ${concentration.result?.finalConcentration}${concentration.result?.concentrationUnit}\n`;
          break;
      }

      if (calc.calculation.result?.steps?.length > 0) {
        report += `\nPASSO A PASSO:\n`;
        calc.calculation.result.steps.forEach((step: string, stepIndex: number) => {
          report += `${stepIndex + 1}. ${step}\n`;
        });
      }

      if (calc.calculation.result?.alerts?.length > 0) {
        report += `\nALERTAS: ${calc.calculation.result.alerts.join(', ')}\n`;
      } else {
        report += `\nALERTAS: Nenhum\n`;
      }

      report += `\n═══════════════════════════════════════\n\n`;
    });

    report += `Relatório gerado por Nurse Pathfinder\n`;
    report += `https://nurse-pathfinder.com\n`;

    return report;
  };

  // Compartilhar via navigator.share (mobile) ou clipboard
  const shareCalculation = async (calculation: CalculationHistory) => {
    const text = exportToText(calculation);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cálculo Medicamentoso',
          text: text
        });
        return { success: true, method: 'native' };
      } catch (error) {
        // Fallback para clipboard se o usuário cancelar
      }
    }

    // Fallback para clipboard
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (error) {
      return { success: false, error: 'Não foi possível compartilhar' };
    }
  };

  // Download como arquivo de texto
  const downloadReport = (calculations: CalculationHistory[], filename?: string) => {
    const report = exportToReport(calculations);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `calculos_medicamentosos_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    history,
    isLoading,
    addCalculation,
    toggleFavorite,
    removeCalculation,
    clearHistory,
    getStats,
    filterHistory,
    exportToText,
    exportToReport,
    shareCalculation,
    downloadReport,
    // Função para limpar históricos antigos/órfãos (administrativa)
    cleanupOldHistories: () => {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(STORAGE_KEY_PREFIX) && key !== getStorageKey()) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        if (keysToRemove.length > 0) {
          console.log(`Removidos ${keysToRemove.length} históricos antigos`);
        }
      } catch (error) {
        console.error('Erro ao limpar históricos:', error);
      }
    }
  };
};