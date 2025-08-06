import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
  message: string;
  isLoading: boolean;
  error: string | null;
}

interface EmailValidationOptions {
  debounceMs?: number;
  enableRealTime?: boolean;
}

export function useEmailValidation(
  email: string,
  options: EmailValidationOptions = {}
) {
  const { debounceMs = 500, enableRealTime = true } = options;
  
  const [validation, setValidation] = useState<EmailValidationResult>({
    isValid: false,
    isAvailable: null,
    message: '',
    isLoading: false,
    error: null
  });

  const [debouncedEmail, setDebouncedEmail] = useState(email);

  // Debounce do email
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [email, debounceMs]);

  // Validação básica de formato
  const validateEmailFormat = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Verificação de disponibilidade no servidor
  const checkEmailAvailability = useCallback(async (email: string): Promise<EmailValidationResult> => {
    if (!validateEmailFormat(email)) {
      return {
        isValid: false,
        isAvailable: null,
        message: 'Formato de email inválido',
        isLoading: false,
        error: null
      };
    }

    setValidation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });

      if (error) {
        console.error('Erro na verificação de email:', error);
        return {
          isValid: true,
          isAvailable: null,
          message: 'Não foi possível verificar a disponibilidade do email',
          isLoading: false,
          error: 'Erro de conexão'
        };
      }

      if (data.code === 'EMAIL_EXISTS') {
        return {
          isValid: true,
          isAvailable: false,
          message: data.message,
          isLoading: false,
          error: null
        };
      } else if (data.code === 'EMAIL_AVAILABLE') {
        return {
          isValid: true,
          isAvailable: true,
          message: '', // Não mostrar mensagem quando email estiver disponível
          isLoading: false,
          error: null
        };
      } else if (data.code === 'RATE_LIMIT_EXCEEDED') {
        return {
          isValid: true,
          isAvailable: null,
          message: data.error,
          isLoading: false,
          error: 'Rate limit excedido'
        };
      }

      return {
        isValid: true,
        isAvailable: null,
        message: 'Verificação concluída',
        isLoading: false,
        error: null
      };

    } catch (error) {
      console.error('Erro na verificação de email:', error);
      return {
        isValid: true,
        isAvailable: null,
        message: 'Erro ao verificar email',
        isLoading: false,
        error: 'Erro de conexão'
      };
    }
  }, [validateEmailFormat]);

  // Efeito para validação em tempo real
  useEffect(() => {
    if (!enableRealTime || !debouncedEmail) {
      setValidation({
        isValid: false,
        isAvailable: null,
        message: '',
        isLoading: false,
        error: null
      });
      return;
    }

    // Validação básica primeiro
    const isValid = validateEmailFormat(debouncedEmail);
    
    if (!isValid) {
      setValidation({
        isValid: false,
        isAvailable: null,
        message: 'Formato de email inválido',
        isLoading: false,
        error: null
      });
      return;
    }

    // Verificação no servidor
    checkEmailAvailability(debouncedEmail).then(result => {
      setValidation(result);
    });

  }, [debouncedEmail, enableRealTime, validateEmailFormat, checkEmailAvailability]);

  // Função para validação manual
  const validateEmail = useCallback(async (email: string): Promise<EmailValidationResult> => {
    return await checkEmailAvailability(email);
  }, [checkEmailAvailability]);

  // Reset da validação
  const resetValidation = useCallback(() => {
    setValidation({
      isValid: false,
      isAvailable: null,
      message: '',
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...validation,
    validateEmail,
    resetValidation
  };
}
