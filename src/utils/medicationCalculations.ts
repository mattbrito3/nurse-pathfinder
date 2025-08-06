import type { 
  DosageCalculation, 
  InfusionCalculation, 
  UnitConversion, 
  ConcentrationCalculation,
  PediatricCalculation,
  SafetyAlert 
} from '@/types/calculator';

// Constantes para cálculos
const EQUIPMENT_FACTORS = {
  macro: 20, // gotas por ml
  micro: 60, // microgotas por ml
  bomba: 1   // ml por ml
};

const UNIT_CONVERSIONS = {
  'g-mg': 1000,
  'mg-mcg': 1000,
  'kg-g': 1000,
  'L-ml': 1000,
  'ml-L': 0.001,
  'g-mcg': 1000000
};

// Cálculo de dosagem por peso
export const calculateDosage = (data: DosageCalculation): DosageCalculation => {
  const steps: string[] = [];
  const alerts: string[] = [];
  
  let totalDose = 0;
  let volumeToAdminister = 0;

  try {
    // Calcular dose total
    if (data.prescribedUnit.includes('/kg')) {
      totalDose = data.patientWeight * data.prescribedDose;
      steps.push(`1. Dose total = Peso × Dose prescrita`);
      steps.push(`   Dose total = ${data.patientWeight}kg × ${data.prescribedDose}${data.prescribedUnit}`);
      steps.push(`   Dose total = ${totalDose}${data.prescribedUnit.replace('/kg', '')}`);
    } else {
      totalDose = data.prescribedDose;
      steps.push(`1. Dose prescrita: ${totalDose}${data.prescribedUnit}`);
    }

    // Calcular volume a administrar
    if (data.concentrationUnit === 'mg/ampola' || data.concentrationUnit === 'g/ampola') {
      if (!data.ampouleVolume) {
        throw new Error('Volume da ampola é obrigatório para ampolas secas');
      }
      
      let concentrationInMg = data.availableConcentration;
      if (data.concentrationUnit === 'g/ampola') {
        concentrationInMg = data.availableConcentration * 1000;
      }
      
      const concentrationPerMl = concentrationInMg / data.ampouleVolume;
      volumeToAdminister = totalDose / concentrationPerMl;
      
      steps.push(`2. Concentração por ml = ${concentrationInMg}mg ÷ ${data.ampouleVolume}ml = ${concentrationPerMl}mg/ml`);
      steps.push(`3. Volume = Dose total ÷ Concentração por ml`);
      steps.push(`   Volume = ${totalDose}mg ÷ ${concentrationPerMl}mg/ml = ${volumeToAdminister.toFixed(2)}ml`);
    } else {
      volumeToAdminister = totalDose / data.availableConcentration;
      steps.push(`2. Volume = Dose total ÷ Concentração disponível`);
      steps.push(`   Volume = ${totalDose}mg ÷ ${data.availableConcentration}mg/ml = ${volumeToAdminister.toFixed(2)}ml`);
    }

    // Validações de segurança
    if (volumeToAdminister > 20) {
      alerts.push('⚠️ Volume muito alto (>20ml). Verifique a concentração.');
    }
    
    if (volumeToAdminister < 0.1) {
      alerts.push('⚠️ Volume muito baixo (<0.1ml). Considere diluição.');
    }

    if (data.prescribedUnit.includes('/kg') && data.prescribedDose > 100) {
      alerts.push('🚨 Dose por kg muito alta. Verificar prescrição!');
    }

    return {
      ...data,
      result: {
        totalDose,
        volumeToAdminister: Math.round(volumeToAdminister * 100) / 100,
        unit: 'ml',
        steps,
        alerts
      }
    };

  } catch (error) {
    return {
      ...data,
      result: {
        totalDose: 0,
        volumeToAdminister: 0,
        unit: 'ml',
        steps: [`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        alerts: ['🚨 Erro no cálculo. Verificar dados inseridos.']
      }
    };
  }
};

// Cálculo de gotejamento
export const calculateInfusion = (data: InfusionCalculation): InfusionCalculation => {
  const steps: string[] = [];
  const alerts: string[] = [];

  try {
    // Converter tempo para minutos
    const timeInMinutes = data.timeUnit === 'h' ? data.totalTime * 60 : data.totalTime;
    const timeInHours = data.timeUnit === 'min' ? data.totalTime / 60 : data.totalTime;

    steps.push(`1. Dados: ${data.totalVolume}ml em ${data.totalTime}${data.timeUnit}`);

    // Calcular ml/h
    const mlPerHour = data.totalVolume / timeInHours;
    steps.push(`2. Velocidade = ${data.totalVolume}ml ÷ ${timeInHours}h = ${mlPerHour.toFixed(1)}ml/h`);

    // Calcular gotas/min para equipos
    let dropsPerMinute = 0;
    let microdropsPerMinute = 0;

    if (data.equipmentType !== 'bomba') {
      const equipmentFactor = EQUIPMENT_FACTORS[data.equipmentType];
      dropsPerMinute = (data.totalVolume * equipmentFactor) / timeInMinutes;
      
      if (data.equipmentType === 'macro') {
        steps.push(`3. Gotas/min = (Volume × 20) ÷ Tempo em min`);
        steps.push(`   Gotas/min = (${data.totalVolume} × 20) ÷ ${timeInMinutes} = ${dropsPerMinute.toFixed(0)} gotas/min`);
      } else {
        microdropsPerMinute = dropsPerMinute;
        steps.push(`3. Microgotas/min = (Volume × 60) ÷ Tempo em min`);
        steps.push(`   Microgotas/min = (${data.totalVolume} × 60) ÷ ${timeInMinutes} = ${microdropsPerMinute.toFixed(0)} microgotas/min`);
      }
    } else {
      steps.push(`3. Bomba de infusão: programar ${mlPerHour.toFixed(1)}ml/h`);
    }

    // Validações de segurança
    if (mlPerHour > 500) {
      alerts.push('⚠️ Velocidade muito alta (>500ml/h). Verificar prescrição.');
    }
    
    if (mlPerHour < 10 && data.totalVolume > 100) {
      alerts.push('⚠️ Velocidade muito baixa. Risco de obstrução.');
    }

    if (dropsPerMinute > 100) {
      alerts.push('⚠️ Muitas gotas/min. Considere equipo microgotas ou bomba.');
    }

    return {
      ...data,
      result: {
        dropsPerMinute: Math.round(dropsPerMinute),
        mlPerHour: Math.round(mlPerHour * 10) / 10,
        microdropsPerMinute: Math.round(microdropsPerMinute),
        steps,
        alerts
      }
    };

  } catch (error) {
    return {
      ...data,
      result: {
        dropsPerMinute: 0,
        mlPerHour: 0,
        microdropsPerMinute: 0,
        steps: [`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        alerts: ['🚨 Erro no cálculo. Verificar dados inseridos.']
      }
    };
  }
};

// Conversão de unidades
export const convertUnits = (data: UnitConversion): UnitConversion => {
  const conversionKey = `${data.fromUnit}-${data.toUnit}`;
  const reverseKey = `${data.toUnit}-${data.fromUnit}`;
  
  let factor = UNIT_CONVERSIONS[conversionKey as keyof typeof UNIT_CONVERSIONS];
  
  if (!factor) {
    factor = 1 / UNIT_CONVERSIONS[reverseKey as keyof typeof UNIT_CONVERSIONS];
  }
  
  if (!factor) {
    return {
      ...data,
      result: {
        convertedValue: 0,
        formula: 'Conversão não suportada',
        explanation: 'Esta conversão não está disponível no sistema.'
      }
    };
  }

  const convertedValue = data.value * factor;
  
  return {
    ...data,
    result: {
      convertedValue,
      formula: `${data.value} ${data.fromUnit} × ${factor} = ${convertedValue} ${data.toUnit}`,
      explanation: `Para converter de ${data.fromUnit} para ${data.toUnit}, multiplique por ${factor}`
    }
  };
};

// Cálculo de concentração (diluição)
export const calculateConcentration = (data: ConcentrationCalculation): ConcentrationCalculation => {
  const steps: string[] = [];
  const safetyTips: string[] = [];

  try {
    // Converter para mg se necessário
    let drugAmountInMg = data.drugAmount;
    if (data.drugUnit === 'g') {
      drugAmountInMg = data.drugAmount * 1000;
    } else if (data.drugUnit === 'mcg') {
      drugAmountInMg = data.drugAmount / 1000;
    }

    const finalConcentration = drugAmountInMg / data.diluentVolume;
    
    steps.push(`1. Medicamento: ${data.drugAmount}${data.drugUnit}`);
    if (data.drugUnit !== 'mg') {
      steps.push(`2. Conversão para mg: ${drugAmountInMg}mg`);
    }
    steps.push(`${data.drugUnit !== 'mg' ? '3' : '2'}. Diluente: ${data.diluentVolume}ml`);
    steps.push(`${data.drugUnit !== 'mg' ? '4' : '3'}. Concentração final = ${drugAmountInMg}mg ÷ ${data.diluentVolume}ml = ${finalConcentration.toFixed(2)}mg/ml`);

    // Dicas de segurança
    safetyTips.push('💡 Sempre aspirar primeiro o diluente, depois o medicamento');
    safetyTips.push('💡 Homogeneizar suavemente após diluição');
    safetyTips.push('💡 Verificar compatibilidade medicamento-diluente');
    
    if (finalConcentration > 100) {
      safetyTips.push('⚠️ Concentração alta. Considere maior diluição.');
    }

    return {
      ...data,
      result: {
        finalConcentration: Math.round(finalConcentration * 100) / 100,
        concentrationUnit: 'mg/ml',
        steps,
        safetyTips
      }
    };

  } catch (error) {
    return {
      ...data,
      result: {
        finalConcentration: 0,
        concentrationUnit: 'mg/ml',
        steps: [`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        safetyTips: ['🚨 Erro no cálculo. Verificar dados inseridos.']
      }
    };
  }
};

// Cálculo pediátrico (superfície corporal)
export const calculatePediatricDose = (data: PediatricCalculation): PediatricCalculation => {
  const steps: string[] = [];
  const alerts: string[] = [];

  try {
    let pediatricDose = 0;
    let bodySurfaceArea = 0;

    if (data.calculationMethod === 'weight') {
      // Cálculo simples por peso (mais comum)
      pediatricDose = (data.patientWeight / 70) * data.adultDose; // 70kg = peso padrão adulto
      steps.push(`1. Método: Proporção por peso`);
      steps.push(`2. Dose pediátrica = (Peso criança ÷ 70kg) × Dose adulto`);
      steps.push(`3. Dose pediátrica = (${data.patientWeight}kg ÷ 70kg) × ${data.adultDose}${data.adultDoseUnit}`);
      steps.push(`4. Dose pediátrica = ${pediatricDose.toFixed(2)}${data.adultDoseUnit}`);
    } else if (data.calculationMethod === 'bsa' && data.bodyHeight) {
      // Cálculo por superfície corporal (mais preciso)
      bodySurfaceArea = Math.sqrt((data.bodyHeight * data.patientWeight) / 3600);
      pediatricDose = (bodySurfaceArea / 1.73) * data.adultDose; // 1.73m² = BSA padrão adulto
      
      steps.push(`1. Método: Superfície Corporal (BSA)`);
      steps.push(`2. BSA = √((altura × peso) ÷ 3600)`);
      steps.push(`3. BSA = √((${data.bodyHeight}cm × ${data.patientWeight}kg) ÷ 3600) = ${bodySurfaceArea.toFixed(2)}m²`);
      steps.push(`4. Dose pediátrica = (BSA ÷ 1.73m²) × Dose adulto`);
      steps.push(`5. Dose pediátrica = (${bodySurfaceArea.toFixed(2)} ÷ 1.73) × ${data.adultDose}${data.adultDoseUnit} = ${pediatricDose.toFixed(2)}${data.adultDoseUnit}`);
    }

    // Dose máxima de segurança (regra geral: não exceder dose adulta)
    const maxSafeDose = data.adultDose;

    // Validações de segurança
    if (pediatricDose > maxSafeDose) {
      alerts.push('🚨 Dose calculada excede dose adulta máxima!');
      pediatricDose = maxSafeDose;
    }

    if (data.patientWeight < 3) {
      alerts.push('⚠️ Peso muito baixo. Cálculo pode não ser adequado para neonatos.');
    }

    if (data.patientAge && data.patientAge < 1) {
      alerts.push('⚠️ Paciente < 1 ano. Consultar protocolos pediátricos específicos.');
    }

    alerts.push('💡 SEMPRE validar com protocolos pediátricos institucionais');

    return {
      ...data,
      result: {
        pediatricDose: Math.round(pediatricDose * 100) / 100,
        maxSafeDose,
        unit: data.adultDoseUnit,
        bodySurfaceArea: bodySurfaceArea > 0 ? Math.round(bodySurfaceArea * 100) / 100 : undefined,
        alerts,
        steps
      }
    };

  } catch (error) {
    return {
      ...data,
      result: {
        pediatricDose: 0,
        maxSafeDose: 0,
        unit: data.adultDoseUnit,
        alerts: ['🚨 Erro no cálculo. Verificar dados inseridos.'],
        steps: [`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }
    };
  }
};

// Função para validar entradas
export const validateCalculationInput = (type: string, data: any): string[] => {
  const errors: string[] = [];

  switch (type) {
    case 'dosage':
      if (!data.patientWeight || data.patientWeight <= 0) {
        errors.push('Peso do paciente deve ser maior que zero');
      }
      if (!data.prescribedDose || data.prescribedDose <= 0) {
        errors.push('Dose prescrita deve ser maior que zero');
      }
      if (!data.availableConcentration || data.availableConcentration <= 0) {
        errors.push('Concentração disponível deve ser maior que zero');
      }
      break;

    case 'infusion':
      if (!data.totalVolume || data.totalVolume <= 0) {
        errors.push('Volume total deve ser maior que zero');
      }
      if (!data.totalTime || data.totalTime <= 0) {
        errors.push('Tempo total deve ser maior que zero');
      }
      break;

    case 'concentration':
      if (!data.drugAmount || data.drugAmount <= 0) {
        errors.push('Quantidade do medicamento deve ser maior que zero');
      }
      if (!data.diluentVolume || data.diluentVolume <= 0) {
        errors.push('Volume do diluente deve ser maior que zero');
      }
      break;
  }

  return errors;
};
