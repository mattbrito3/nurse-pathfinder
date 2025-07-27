/**
 * 🛡️ INPUT VALIDATION UTILITIES
 * Smart validation for medication calculator inputs
 */

// 📝 Regex patterns for validation
export const VALIDATION_PATTERNS = {
  // Only letters, spaces, hyphens, and common medication characters
  medicationName: /^[a-zA-ZÀ-ÿ\s\-\(\)\.°]+$/,
  // Only numbers, dots, and commas for decimal values
  numericValue: /^[0-9.,]+$/,
  // Only positive numbers (including decimals)
  positiveNumber: /^\d*\.?\d*$/,
} as const;

// 🚫 Characters not allowed in medication names
const FORBIDDEN_MEDICATION_CHARS = /[0-9!@#$%^&*+={}[\]|\\:";'<>?/_`~]/;

// 🚫 Characters not allowed in numeric fields
const FORBIDDEN_NUMERIC_CHARS = /[a-zA-ZÀ-ÿ!@#$%^&*()+={}[\]|\\:";'<>?/_`~\-]/;

/**
 * 🧹 Sanitize medication name input
 * Removes invalid characters in real-time
 */
export const sanitizeMedicationName = (input: string): string => {
  // Remove numbers and special characters, keep only letters, spaces, hyphens, parentheses, dots
  return input.replace(FORBIDDEN_MEDICATION_CHARS, '');
};

/**
 * 🔢 Sanitize numeric input 
 * Removes invalid characters and ensures proper decimal format
 */
export const sanitizeNumericInput = (input: string): string => {
  // Remove non-numeric characters except dots and commas
  let sanitized = input.replace(FORBIDDEN_NUMERIC_CHARS, '');
  
  // Replace comma with dot for decimal consistency
  sanitized = sanitized.replace(',', '.');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return sanitized;
};

/**
 * ✅ Validate medication name
 */
export const validateMedicationName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!name.trim()) {
    return {
      isValid: false,
      error: 'Nome do medicamento é obrigatório'
    };
  }
  
  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Nome deve ter pelo menos 2 caracteres'
    };
  }
  
  // Check for numbers in medication name
  if (/\d/.test(name)) {
    return {
      isValid: false,
      error: 'Nome do medicamento não pode conter números'
    };
  }
  
  // Check for excessive special characters
  if (FORBIDDEN_MEDICATION_CHARS.test(name)) {
    return {
      isValid: false,
      error: 'Nome contém caracteres não permitidos'
    };
  }
  
  return { isValid: true };
};

/**
 * 🔢 Validate numeric value
 */
export const validateNumericValue = (value: string | number, fieldName: string): {
  isValid: boolean;
  error?: string;
} => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue <= 0) {
    return {
      isValid: false,
      error: `${fieldName} deve ser um número positivo`
    };
  }
  
  // Check for reasonable limits
  if (numValue > 10000) {
    return {
      isValid: false,
      error: `${fieldName} parece muito alto (máximo: 10.000)`
    };
  }
  
  return { isValid: true };
};

/**
 * 🎯 Smart input handler for medication names
 */
export const handleMedicationNameInput = (
  value: string,
  onChange: (value: string) => void,
  onValidation?: (isValid: boolean, error?: string) => void
) => {
  // Sanitize input first
  const sanitized = sanitizeMedicationName(value);
  
  // Update value
  onChange(sanitized);
  
  // Validate and report
  if (onValidation) {
    const validation = validateMedicationName(sanitized);
    onValidation(validation.isValid, validation.error);
  }
};

/**
 * 🔢 Smart input handler for numeric values
 */
export const handleNumericInput = (
  value: string,
  fieldName: string,
  onChange: (value: number) => void,
  onValidation?: (isValid: boolean, error?: string) => void
) => {
  // Sanitize input first
  const sanitized = sanitizeNumericInput(value);
  
  // Convert to number
  const numericValue = sanitized === '' ? 0 : parseFloat(sanitized);
  
  // Update value
  onChange(numericValue);
  
  // Validate and report
  if (onValidation && sanitized !== '') {
    const validation = validateNumericValue(numericValue, fieldName);
    onValidation(validation.isValid, validation.error);
  }
};

/**
 * 🛡️ Comprehensive form validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateDosageForm = (data: {
  medicationName: string;
  patientWeight: number;
  prescribedDose: number;
  availableConcentration: number;
  ampouleVolume?: number;
}): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate medication name
  const nameValidation = validateMedicationName(data.medicationName);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }
  
  // Validate patient weight
  const weightValidation = validateNumericValue(data.patientWeight, 'Peso do paciente');
  if (!weightValidation.isValid) {
    errors.push(weightValidation.error!);
  } else if (data.patientWeight < 0.5) {
    warnings.push('Peso muito baixo - verifique se está correto');
  } else if (data.patientWeight > 300) {
    warnings.push('Peso muito alto - verifique se está correto');
  }
  
  // Validate prescribed dose
  const doseValidation = validateNumericValue(data.prescribedDose, 'Dose prescrita');
  if (!doseValidation.isValid) {
    errors.push(doseValidation.error!);
  }
  
  // Validate concentration
  const concentrationValidation = validateNumericValue(data.availableConcentration, 'Concentração');
  if (!concentrationValidation.isValid) {
    errors.push(concentrationValidation.error!);
  }
  
  // Validate ampoule volume if provided
  if (data.ampouleVolume !== undefined && data.ampouleVolume > 0) {
    const volumeValidation = validateNumericValue(data.ampouleVolume, 'Volume da ampola');
    if (!volumeValidation.isValid) {
      errors.push(volumeValidation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * 📋 Example medication names for suggestions
 */
export const COMMON_MEDICATIONS = [
  'Dipirona', 'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Azitromicina',
  'Omeprazol', 'Diclofenaco', 'Tramadol', 'Dexametasona', 'Furosemida',
  'Captopril', 'Losartana', 'Metformina', 'Insulina', 'Morfina',
  'Fentanil', 'Propofol', 'Midazolam', 'Dobutamina', 'Noradrenalina'
] as const;

/**
 * 💡 Get medication suggestions based on input
 */
export const getMedicationSuggestions = (input: string): string[] => {
  if (input.length < 2) return [];
  
  const searchTerm = input.toLowerCase().trim();
  return COMMON_MEDICATIONS.filter(med => 
    med.toLowerCase().includes(searchTerm)
  ).slice(0, 5); // Limit to 5 suggestions
};