/**
 * 🔒 PASSWORD RESET SERVICE - For forgot password functionality
 * Handles password reset requests with clear user guidance
 */

import { supabase } from '@/integrations/supabase/client';

interface PasswordResetResponse {
  success: boolean;
  method?: string;
  error?: string;
  resetId?: string;
  message?: string;
}

/**
 * 🔒 Send password reset via Edge Function
 */
export const sendPasswordReset = async (
  userEmail: string
): Promise<PasswordResetResponse> => {
  
  console.log('🔒 DOSE CERTA - RECUPERAÇÃO DE SENHA');
  console.log('📧 Processando solicitação...');
  console.log('');

  try {
    // Chamar a edge function de reset de senha
    const { data, error } = await supabase.functions.invoke('password-reset', {
      body: { email: userEmail }
    });

    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error(error.message || 'Erro ao processar reset de senha');
    }

    console.log('✅ Resposta da edge function:', data);

    if (data.success) {
      console.log('✅ Email de recuperação enviado com sucesso!');
      console.log('📧 Verifique sua caixa de entrada');
      console.log('📬 De: Dose Certa <team@dosecerta.online>');
      console.log('');
      
      return {
        success: true,
        method: 'Edge Function + Resend',
        message: data.message || 'Link de recuperação enviado para seu email.',
        resetId: `reset_${Date.now()}`
      };
    } else {
      throw new Error(data.error || 'Erro desconhecido');
    }

  } catch (error: any) {
    console.error('❌ Erro no reset de senha:', error);
    
    // Fallback para o método anterior se a edge function falhar
    console.log('🔄 Tentando método alternativo...');
    
    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (supabaseError) {
        console.warn('⚠️ Supabase reset também falhou:', supabaseError.message);
        throw error; // Re-throw o erro original
      }

      console.log('✅ Reset via Supabase Auth enviado!');
      
      return {
        success: true,
        method: 'Supabase Auth',
        message: 'Link de recuperação enviado para seu email.',
        resetId: 'supabase_reset'
      };

    } catch (fallbackError: any) {
      console.error('❌ Todos os métodos falharam:', fallbackError);
      
      return {
        success: false,
        method: 'Failed',
        error: error.message || 'Erro ao processar recuperação de senha',
        resetId: `failed_${Date.now()}`
      };
    }
  }
};

/**
 * 🧪 Test password reset service
 */
export const testPasswordResetService = async (): Promise<void> => {
  console.log('🧪 Testing PASSWORD RESET service...');
  
  const result = await sendPasswordReset('test@example.com');
  
  console.log('🧪 Test result:', result);
};
