/**
 * Email validation utilities with real domain checking
 */

// List of common valid email domains
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'live.com', 'msn.com', 'me.com',
  // Brazilian domains
  'uol.com.br', 'terra.com.br', 'bol.com.br', 'ig.com.br', 'globo.com',
  'r7.com', 'zipmail.com.br', 'oi.com.br', 'vivo.com.br', 'tim.com.br',
  // Professional domains
  'edu', 'gov', 'org', 'net', 'edu.br', 'gov.br', 'com.br'
];

// Enhanced email regex (more strict)
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Basic email format validation
 */
export const isValidEmailFormat = (email: string): boolean => {
  if (!email || email.length > 254) return false;
  
  // Check basic format
  if (!EMAIL_REGEX.test(email)) return false;
  
  // Check for consecutive dots
  if (email.includes('..')) return false;
  
  // Check local part length (before @)
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) return false;
  
  return true;
};

/**
 * Check if domain is in common domains list
 */
export const isCommonDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return COMMON_DOMAINS.some(commonDomain => 
    domain === commonDomain || domain.endsWith('.' + commonDomain)
  );
};

/**
 * Check if domain exists using DNS lookup (browser-compatible version)
 * This uses a public DNS-over-HTTPS service
 */
export const checkDomainExists = async (domain: string): Promise<boolean> => {
  try {
    // Use Google's DNS-over-HTTPS service to check if domain has MX records
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/dns-json'
        }
      }
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    
    // If Status is 0 (NOERROR) and Answer exists, domain has MX records
    return data.Status === 0 && data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.warn('Domain check failed:', error);
    // Fallback: if DNS check fails, allow the email (don't block legitimate users)
    return true;
  }
};

/**
 * Comprehensive email validation
 */
export const validateEmail = async (email: string): Promise<{
  isValid: boolean;
  error?: string;
  suggestion?: string;
}> => {
  // Step 1: Basic format validation
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido.'
    };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  
  // Step 2: Check for common typos and suggest corrections
  const suggestion = suggestEmailCorrection(email);
  if (suggestion && suggestion !== email) {
    return {
      isValid: false,
      error: 'Possível erro de digitação no email.',
      suggestion: `Você quis dizer: ${suggestion}?`
    };
  }
  
  // Step 3: Check if it's a common domain (fast validation)
  if (isCommonDomain(email)) {
    return { isValid: true };
  }
  
  // Step 4: For uncommon domains, check if they exist
  const domainExists = await checkDomainExists(domain);
  if (!domainExists) {
    return {
      isValid: false,
      error: 'Domínio de email não encontrado. Verifique se está correto.'
    };
  }
  
  return { isValid: true };
};

/**
 * Suggest email corrections for common typos
 */
export const suggestEmailCorrection = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  const commonCorrections: Record<string, string> = {
    // Gmail variations
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmaill.com': 'gmail.com',
    
    // Yahoo variations
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    
    // Outlook/Hotmail variations
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloook.com': 'outlook.com',
    
    // Brazilian domains
    'uol.com': 'uol.com.br',
    'tera.com.br': 'terra.com.br',
    'golobo.com': 'globo.com'
  };
  
  const correctedDomain = commonCorrections[domain.toLowerCase()];
  return correctedDomain ? `${localPart}@${correctedDomain}` : email;
};

/**
 * Real-time email validation for forms (debounced)
 */
export const createEmailValidator = (debounceMs: number = 500) => {
  let timeoutId: NodeJS.Timeout;
  
  return (email: string): Promise<{
    isValid: boolean;
    error?: string;
    suggestion?: string;
  }> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        const result = await validateEmail(email);
        resolve(result);
      }, debounceMs);
    });
  };
};