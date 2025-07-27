import { useState, useEffect, useCallback } from 'react';
import { validateEmail, suggestEmailCorrection } from '@/utils/emailValidation';

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  suggestion: string | null;
}

export const useEmailValidation = (email: string, debounceMs: number = 800) => {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    suggestion: null
  });

  const validateEmailDebounced = useCallback(async (emailToValidate: string) => {
    if (!emailToValidate || !emailToValidate.includes('@')) {
      setState({
        isValidating: false,
        isValid: null,
        error: null,
        suggestion: null
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await validateEmail(emailToValidate);
      setState({
        isValidating: false,
        isValid: result.isValid,
        error: result.error || null,
        suggestion: result.suggestion || null
      });
    } catch (error) {
      setState({
        isValidating: false,
        isValid: false,
        error: 'Erro ao validar email. Tente novamente.',
        suggestion: null
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateEmailDebounced(email);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [email, debounceMs, validateEmailDebounced]);

  const applySuggestion = useCallback(() => {
    if (state.suggestion) {
      // Extract the suggested email from the suggestion text
      const match = state.suggestion.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return match ? match[1] : email;
    }
    return email;
  }, [state.suggestion, email]);

  return {
    ...state,
    applySuggestion
  };
};