import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { 
  CalculationHistory, 
  CalculationType, 
  DosageCalculation, 
  InfusionCalculation, 
  UnitConversion, 
  ConcentrationCalculation,
  PediatricCalculation 
} from '@/types/calculator';
import jsPDF from 'jspdf';

const STORAGE_KEY_PREFIX = 'medication_calculation_history';
const MAX_HISTORY_ITEMS = 50; // Limitar histórico para performance
const ITEMS_PER_PAGE = 20; // Paginação

interface DatabaseCalculationHistory {
  id: string;
  user_id: string;
  type: CalculationType;
  medication_name: string | null;
  calculation_data: any;
  result_data: any;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const useCalculationHistory = (page = 0) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  // Converter dados do banco para o formato da aplicação
  const convertFromDatabase = (dbItem: DatabaseCalculationHistory): CalculationHistory => {
    return {
      id: dbItem.id,
      type: dbItem.type,
      calculation: {
        ...dbItem.calculation_data,
        result: dbItem.result_data
      },
      timestamp: new Date(dbItem.created_at),
      isFavorite: dbItem.is_favorite,
      medicationName: dbItem.medication_name || undefined
    };
  };

  // Verificar se a tabela existe
  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('calculation_history')
        .select('id')
        .limit(1);
      
      return !error || !error.message?.includes('does not exist');
    } catch (error) {
      return false;
    }
  };

  // Carregar histórico do Supabase
  const loadHistoryFromDatabase = async () => {
    if (!user?.id) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    // Verificar se a tabela existe primeiro
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.log('Tabela calculation_history não existe. Usando localStorage como fallback.');
      await loadHistoryFromLocalStorage();
      return;
    }

    try {
      // Buscar total de registros
      const { count } = await supabase
        .from('calculation_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalCount(count || 0);

      // Buscar dados paginados
      const { data, error } = await supabase
        .from('calculation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (error) {
        console.error('Erro ao carregar histórico do banco:', error);
        // Fallback para localStorage se houver erro
        await loadHistoryFromLocalStorage();
        return;
      }

      const convertedHistory = (data || []).map(convertFromDatabase);
      
      // Se é página 0, substitui. Se não, adiciona (infinite scroll)
      if (page === 0) {
        setHistory(convertedHistory);
      } else {
        setHistory(prev => [...prev, ...convertedHistory]);
      }

      setHasNextPage((data || []).length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      // Fallback para localStorage
      await loadHistoryFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback: carregar do localStorage
  const loadHistoryFromLocalStorage = async () => {
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
        
        // Tentar migrar para o banco de dados
        if (user?.id) {
          await migrateLocalStorageToDatabase(historyWithDates);
        }
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do localStorage:', error);
      setHistory([]);
    }
  };

  // Migrar localStorage para Supabase
  const migrateLocalStorageToDatabase = async (localHistory: CalculationHistory[]) => {
    if (!user?.id || localHistory.length === 0) return;

    try {
      const dataToInsert = localHistory.map(item => ({
        user_id: user.id,
        type: item.type,
        medication_name: item.medicationName,
        calculation_data: {
          ...item.calculation,
          result: undefined // Remover result do calculation_data
        },
        result_data: item.calculation.result,
        is_favorite: item.isFavorite,
        created_at: item.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('calculation_history')
        .insert(dataToInsert);

      if (!error) {
        console.log(`Migrados ${localHistory.length} cálculos para o banco de dados`);
        // Limpar localStorage após migração bem-sucedida
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Erro ao migrar para o banco:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadHistoryFromDatabase();
    } else {
      // Usuário não logado - usar localStorage
      loadHistoryFromLocalStorage();
    }
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
  const addCalculation = async (
    type: CalculationType,
    calculation: any,
    medicationName?: string
  ) => {
    // Usar localStorage sempre se não tiver usuário ou se a tabela não existir
    if (!user?.id) {
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
    }

    // Verificar se a tabela existe
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.log('Tabela não existe. Usando localStorage.');
      const newItem: CalculationHistory = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        calculation,
        timestamp: new Date(),
        isFavorite: false,
        medicationName: medicationName || calculation.medicationName
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      saveToStorage(newHistory);
      
      return newItem.id;
    }

    try {
      const { data, error } = await supabase
        .from('calculation_history')
        .insert({
          user_id: user.id,
          type,
          medication_name: medicationName || calculation.medicationName || null,
          calculation_data: {
            ...calculation,
            result: undefined // Remover result do calculation_data
          },
          result_data: calculation.result,
          is_favorite: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar cálculo:', error);
        throw error;
      }

      // Atualizar estado local
      const newItem = convertFromDatabase({
        ...data,
        type: data.type as CalculationType // Corrige o tipo para evitar erro de tipagem
      });
      setHistory(prev => [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      
      return data.id;
    } catch (error) {
      console.error('Erro ao adicionar cálculo:', error);
      // Fallback para localStorage em caso de erro
      const newItem: CalculationHistory = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        calculation,
        timestamp: new Date(),
        isFavorite: false,
        medicationName: medicationName || calculation.medicationName
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      saveToStorage(newHistory);
      
      return newItem.id;
    }
  };

  // Alternar favorito
  const toggleFavorite = async (id: string) => {
    const item = history.find(h => h.id === id);
    if (!item) return;

    const newIsFavorite = !item.isFavorite;

    // Verificar se pode usar banco de dados
    if (user?.id) {
      const tableExists = await checkTableExists();
      if (tableExists) {
        try {
          const { error } = await supabase
            .from('calculation_history')
            .update({ is_favorite: newIsFavorite })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            console.error('Erro ao atualizar favorito:', error);
            throw new Error('Falha ao atualizar favorito no banco de dados');
          }
        } catch (error) {
          console.error('Erro ao togglear favorito:', error);
          throw error;
        }
      }
    }

    // Atualizar estado local
    const newHistory = history.map(h =>
      h.id === id ? { ...h, isFavorite: newIsFavorite } : h
    );
    setHistory(newHistory);
    
    // Salvar no localStorage também
    saveToStorage(newHistory);
  };

  // Remover cálculo
  const removeCalculation = async (id: string) => {
    // Verificar se pode usar banco de dados
    if (user?.id) {
      const tableExists = await checkTableExists();
      if (tableExists) {
        try {
          const { error } = await supabase
            .from('calculation_history')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            console.error('Erro ao remover cálculo:', error);
            throw new Error('Falha ao remover do banco de dados');
          }
        } catch (error) {
          console.error('Erro ao deletar cálculo:', error);
          throw error;
        }
      }
    }

    // Atualizar estado local
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    console.log(`Removido cálculo ${id}. Histórico agora tem ${newHistory.length} itens`);
    
    // Salvar no localStorage também
    saveToStorage(newHistory);
  };

  // Limpar todo histórico
  const clearHistory = async () => {
    // Verificar se pode usar banco de dados
    if (user?.id) {
      const tableExists = await checkTableExists();
      if (tableExists) {
        try {
          const { error } = await supabase
            .from('calculation_history')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            console.error('Erro ao limpar histórico:', error);
            throw new Error('Falha ao limpar histórico do banco de dados');
          }
        } catch (error) {
          console.error('Erro ao limpar histórico:', error);
          throw error;
        }
      }
    }

    // Atualizar estado local
    setHistory([]);
    console.log('Histórico limpo completamente');
    
    // Limpar localStorage também
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    console.log('LocalStorage limpo também');
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
        const dosage = calculation.calculation as DosageCalculation;
        text += `${dosage.medicationName || 'Medicamento'} - ${dosage.patientWeight}kg paciente\n`;
        text += `Dose: ${dosage.prescribedDose}${dosage.prescribedUnit} → ${dosage.result?.volumeToAdminister}${dosage.result?.unit}\n`;
        text += `(${dosage.availableConcentration}${dosage.concentrationUnit} disponível)\n`;
        break;

      case 'infusion':
        const infusion = calculation.calculation as InfusionCalculation;
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
        const conversion = calculation.calculation as UnitConversion;
        text += `Conversão: ${conversion.value} ${conversion.fromUnit} = ${conversion.result?.convertedValue} ${conversion.toUnit}\n`;
        break;

      case 'concentration':
        const concentration = calculation.calculation as ConcentrationCalculation;
        text += `Diluição: ${concentration.drugAmount}${concentration.drugUnit} em ${concentration.diluentVolume}ml\n`;
        text += `Concentração final: ${concentration.result?.finalConcentration}${concentration.result?.concentrationUnit}\n`;
        break;
    }

    if (calculation.calculation.result?.alert?.length > 0) {
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
          const infusion = calculation.calculation as InfusionCalculation;
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
          const conversion = calc.calculation as UnitConversion;
          report += `De: ${conversion.value} ${conversion.fromUnit}\n`;
          report += `Para: ${conversion.result?.convertedValue} ${conversion.toUnit}\n`;
          break;

        case 'concentration':
          const concentration = calc.calculation as ConcentrationCalculation;
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

  // Gerar PDF profissional
  const exportToPDF = (calculations: CalculationHistory[]): jsPDF => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    let currentY = 20;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
        return true;
      }
      return false;
    };

    // Função para texto multilinha
    const addMultilineText = (text: string, x: number, y: number, maxWidth: number, lineHeight = 6) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * lineHeight;
    };

    // Header do documento
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO DE CÁLCULOS MEDICAMENTOS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Logo/marca (texto simples)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('🏥 Nurse Pathfinder', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Informações do relatório
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    pdf.setFontSize(10);
    pdf.text(`Data: ${dateStr} - ${timeStr}`, 20, currentY);
    pdf.text(`Total de cálculos: ${calculations.length}`, 20, currentY + 6);
    currentY += 20;

    // Linha separadora
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;

    // Iterar pelos cálculos
    calculations.forEach((calc, index) => {
      checkPageBreak(50); // Espaço mínimo necessário

      // Título do cálculo
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const title = `CÁLCULO #${index + 1} - ${calc.type.toUpperCase()}`;
      pdf.text(title, 20, currentY);
      currentY += 10;

      // Data e hora
      const calcDate = calc.timestamp.toLocaleDateString('pt-BR');
      const calcTime = calc.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${calcDate} - ${calcTime}`, 20, currentY);
      
      if (calc.isFavorite) {
        pdf.setTextColor(255, 215, 0); // Dourado
        pdf.text('⭐ FAVORITO', 120, currentY);
        pdf.setTextColor(0, 0, 0); // Voltar para preto
      }
      currentY += 8;

      // Dados específicos por tipo
      pdf.setFontSize(9);
      let detailsText = '';

      switch (calc.type) {
        case 'dosage':
          const dosage = calc.calculation as DosageCalculation;
          detailsText = `Medicamento: ${dosage.medicationName || 'N/A'}\n`;
          detailsText += `Peso do paciente: ${dosage.patientWeight} kg\n`;
          detailsText += `Dose prescrita: ${dosage.prescribedDose} ${dosage.prescribedUnit}\n`;
          detailsText += `Concentração disponível: ${dosage.availableConcentration} ${dosage.concentrationUnit}\n`;
          detailsText += `Volume a administrar: ${dosage.result?.volumeToAdminister} ${dosage.result?.unit}`;
          break;

        case 'infusion':
          const infusion = calc.calculation;
          detailsText = `Volume total: ${infusion.totalVolume} ml\n`;
          detailsText += `Tempo total: ${infusion.totalTime} ${infusion.timeUnit}\n`;
          detailsText += `Tipo de equipo: ${infusion.equipmentType}\n`;
          detailsText += `Velocidade: ${infusion.result?.mlPerHour} ml/h`;
          if (infusion.equipmentType !== 'bomba') {
            const drops = infusion.equipmentType === 'macro' 
              ? infusion.result?.dropsPerMinute 
              : infusion.result?.microdropsPerMinute;
            const unit = infusion.equipmentType === 'macro' ? 'gotas/min' : 'microgotas/min';
            detailsText += `\nGotejamento: ${drops} ${unit}`;
          }
          break;

        case 'conversion':
          const conversion = calc.calculation;
          detailsText = `Conversão: ${conversion.value} ${conversion.fromUnit} → ${conversion.result?.convertedValue} ${conversion.toUnit}`;
          break;

        case 'concentration':
          const concentration = calc.calculation;
          detailsText = `Medicamento: ${concentration.drugAmount} ${concentration.drugUnit}\n`;
          detailsText += `Volume do diluente: ${concentration.diluentVolume} ml\n`;
          detailsText += `Concentração final: ${concentration.result?.finalConcentration} ${concentration.result?.concentrationUnit}`;
          break;
      }

      const detailsHeight = addMultilineText(detailsText, 20, currentY, pageWidth - 40);
      currentY += detailsHeight + 5;

      // Passo a passo (se existir)
      if (calc.calculation.result?.steps?.length > 0) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PASSO A PASSO:', 20, currentY);
        currentY += 6;
        
        pdf.setFont('helvetica', 'normal');
        calc.calculation.result.steps.forEach((step: string, stepIndex: number) => {
          checkPageBreak(8);
          const stepText = `${stepIndex + 1}. ${step}`;
          const stepHeight = addMultilineText(stepText, 25, currentY, pageWidth - 50);
          currentY += stepHeight;
        });
        currentY += 3;
      }

      // Alertas (se existirem)
      if (calc.calculation.result?.alerts?.length > 0) {
        checkPageBreak(15);
        pdf.setTextColor(255, 0, 0); // Vermelho para alertas
        pdf.setFont('helvetica', 'bold');
        pdf.text('⚠️ ALERTAS:', 20, currentY);
        currentY += 6;
        
        pdf.setFont('helvetica', 'normal');
        const alertsText = calc.calculation.result.alerts.join(', ');
        const alertsHeight = addMultilineText(alertsText, 25, currentY, pageWidth - 50);
        currentY += alertsHeight;
        pdf.setTextColor(0, 0, 0); // Voltar para preto
      } else {
        checkPageBreak(10);
        pdf.setTextColor(0, 128, 0); // Verde para OK
        pdf.text('✅ Nenhum alerta', 20, currentY);
        pdf.setTextColor(0, 0, 0); // Voltar para preto
        currentY += 6;
      }

      // Linha separadora entre cálculos
      currentY += 5;
      checkPageBreak(10);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, currentY, pageWidth - 20, currentY);
      currentY += 10;
    });

    // Footer
    checkPageBreak(20);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Relatório gerado por Nurse Pathfinder - https://nurse-pathfinder.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Numeração de páginas
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }

    return pdf;
  };

  // PDF download removed - only TXT format available

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
    exportToPDF,
    shareCalculation,
    downloadReport,
    hasNextPage,
    totalCount,
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