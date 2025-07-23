// Tipos para calculadora de medicação
export interface DosageCalculation {
  patientWeight: number;
  medicationName: string;
  prescribedDose: number;
  prescribedUnit: 'mg/kg' | 'mcg/kg' | 'mg' | 'mcg' | 'UI/kg';
  availableConcentration: number;
  concentrationUnit: 'mg/ml' | 'mcg/ml' | 'mg/ampola' | 'UI/ml' | 'g/ampola';
  ampouleVolume?: number; // Para ampolas secas
  result?: {
    totalDose: number;
    volumeToAdminister: number;
    unit: string;
    steps: string[];
    alerts: string[];
  };
}

export interface InfusionCalculation {
  totalVolume: number;
  totalTime: number;
  timeUnit: 'min' | 'h';
  equipmentType: 'macro' | 'micro' | 'bomba';
  result?: {
    dropsPerMinute: number;
    mlPerHour: number;
    microdropsPerMinute: number;
    steps: string[];
    alerts: string[];
  };
}

export interface UnitConversion {
  value: number;
  fromUnit: string;
  toUnit: string;
  category: 'weight' | 'volume' | 'concentration';
  result?: {
    convertedValue: number;
    formula: string;
    explanation: string;
  };
}

export interface ConcentrationCalculation {
  drugAmount: number;
  drugUnit: 'mg' | 'g' | 'mcg' | 'UI';
  diluentVolume: number;
  result?: {
    finalConcentration: number;
    concentrationUnit: string;
    steps: string[];
    safetyTips: string[];
  };
}

export interface PediatricCalculation {
  patientWeight: number;
  patientAge?: number;
  bodyHeight?: number;
  medicationName: string;
  adultDose: number;
  adultDoseUnit: string;
  calculationMethod: 'weight' | 'bsa' | 'age';
  result?: {
    pediatricDose: number;
    maxSafeDose: number;
    unit: string;
    bodySurfaceArea?: number;
    alerts: string[];
    steps: string[];
  };
}

export type CalculationType = 'dosage' | 'infusion' | 'conversion' | 'concentration' | 'pediatric';

export interface CalculationHistory {
  id: string;
  type: CalculationType;
  calculation: DosageCalculation | InfusionCalculation | UnitConversion | ConcentrationCalculation | PediatricCalculation;
  timestamp: Date;
  isFavorite: boolean;
}

export interface SafetyAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
  recommendation?: string;
}