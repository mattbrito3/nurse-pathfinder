/**
 * 🔒 RESET PASSWORD SERVICE - For password reset functionality
 * Handles password reset token validation and password update
 */

import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

/**
 * 🔒 Validate reset token
 */
export const validateResetToken = async (
  token: string
): Promise<ResetPasswordResponse> => {
  
  console.log('🔍 Validando token de reset...');
  console.log('🔑 Token:', token.substring(0, 8) + '...');

  try {
    const { data, error } = await supabase.functions.invoke('verify-reset-token', {
      body: { 
        token: token,
        newPassword: 'temp_validation_only' // Senha temporária apenas para validação
      }
    });

    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error(error.message || 'Erro ao validar token');
    }

    console.log('✅ Resposta da validação:', data);

    return {
      success: data.success,
      message: data.message,
      email: data.email,
      error: data.error
    };

  } catch (error: any) {
    console.error('❌ Erro na validação:', error);
    
    return {
      success: false,
      message: error.message || 'Erro ao validar token de reset',
      error: error.message
    };
  }
};

/**
 * 🔒 Process password reset
 */
export const processPasswordReset = async (
  token: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  
  console.log('🔒 Processando reset de senha...');
  console.log('🔑 Token:', token.substring(0, 8) + '...');

  try {
    const { data, error } = await supabase.functions.invoke('verify-reset-token', {
      body: { 
        token: token,
        newPassword: newPassword
      }
    });

    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error(error.message || 'Erro ao processar reset de senha');
    }

    console.log('✅ Resposta do processamento:', data);

    return {
      success: data.success,
      message: data.message,
      email: data.email,
      error: data.error
    };

  } catch (error: any) {
    console.error('❌ Erro no processamento:', error);
    
    return {
      success: false,
      message: error.message || 'Erro ao processar reset de senha',
      error: error.message
    };
  }
};

/**
 * 🧪 Test reset password service
 */
export const testResetPasswordService = async (): Promise<void> => {
  console.log('🧪 Testing RESET PASSWORD service...');
  
  // Teste com token inválido
  const result = await validateResetToken('invalid_token');
  
  console.log('🧪 Test result:', result);
}; 