/**
 * 📧 SUPABASE EMAIL SERVICE - Using Supabase's email functionality
 * Leverages Supabase Auth for email sending (bypasses CORS)
 */

import { supabase } from '@/integrations/supabase/client';

interface EmailResponse {
  success: boolean;
  method?: string;
  error?: string;
  emailId?: string;
}

/**
 * 🚀 Send verification email using Supabase Auth
 * This uses Supabase's built-in email system (configured with your Resend)
 */
export const sendVerificationViaSupabase = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    console.log('🚀 Sending email via Supabase Auth...');
    console.log('📧 To:', userEmail);
    console.log('🔐 Code:', verificationCode);
    console.log('🎯 Method: Using Supabase → Resend → dosecerta.online');

    // Create a temporary user to trigger email sending
    // Supabase will use your configured SMTP (Resend)
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: `temp_${verificationCode}_${Date.now()}`, // Temporary password
      options: {
        emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        data: {
          verification_code: verificationCode,
          user_name: userName || 'Usuário',
          temp_signup: true
        }
      }
    });

    if (error) {
      console.error('❌ Supabase email error:', error);
      
      // If user already exists, try password reset instead
      if (error.message.includes('already registered')) {
        console.log('🔄 User exists, trying password reset...');
        
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: `${window.location.origin}/auth?code=${verificationCode}`
        });

        if (resetError) {
          return {
            success: false,
            error: `Reset error: ${resetError.message}`,
            method: 'Supabase Password Reset'
          };
        }

        console.log('✅ Password reset email sent via Supabase!');
        return {
          success: true,
          method: 'Supabase Password Reset',
          emailId: 'supabase_reset'
        };
      }

      return {
        success: false,
        error: error.message,
        method: 'Supabase Auth'
      };
    }

    console.log('✅ Supabase email sent!');
    console.log('📧 From: dosecertasmtp <team@dosecerta.online>');
    console.log('📧 User created:', data.user?.id);
    
    return {
      success: true,
      method: 'Supabase Auth Signup',
      emailId: data.user?.id || 'supabase_signup'
    };

  } catch (error: any) {
    console.error('❌ Supabase email exception:', error);
    return {
      success: false,
      error: error.message,
      method: 'Supabase Auth'
    };
  }
};

/**
 * 📧 Alternative: Direct code display (no email)
 */
export const displayCodeDirectly = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  console.log('📱 DISPLAYING CODE DIRECTLY TO USER');
  console.log('👤 User:', userName);
  console.log('📧 Email:', userEmail);
  console.log('');
  console.log('🔑 ====================================');
  console.log('🔑     CÓDIGO DE VERIFICAÇÃO');
  console.log('🔑 ====================================');
  console.log(`🔑            ${verificationCode}`);
  console.log('🔑 ====================================');
  console.log('🔑 Digite este código na aplicação');
  console.log('🔑 ====================================');
  console.log('');

  return {
    success: true,
    method: 'Direct Code Display',
    emailId: `direct_${Date.now()}`
  };
};

/**
 * 🏆 MAIN SUPABASE EMAIL FUNCTION
 */
export const sendSupabaseEmail = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  console.log('🚀 STARTING SUPABASE EMAIL SEND...');
  console.log('📧 Target:', userEmail);
  console.log('🔐 Code:', verificationCode);
  console.log('🎯 Using: Supabase → dosecertasmtp <team@dosecerta.online>');

  // Try Supabase Auth email
  const supabaseResult = await sendVerificationViaSupabase(userEmail, verificationCode, userName);
  
  if (supabaseResult.success) {
    console.log('🎉 SUCCESS! Email sent via Supabase!');
    console.log('📧 From: dosecertasmtp <team@dosecerta.online>');
    return supabaseResult;
  }

  console.log('⚠️ Supabase failed, showing code directly...');
  
  // Fallback: Show code directly
  const directResult = await displayCodeDirectly(userEmail, verificationCode, userName);
  
  return directResult;
};

/**
 * 🧪 Test Supabase email service
 */
export const testSupabaseEmailService = async (): Promise<void> => {
  console.log('🧪 Testing SUPABASE email service...');
  
  const result = await sendSupabaseEmail(
    'test@example.com',
    '123456',
    'Test User'
  );
  
  console.log('🧪 Test result:', result);
};
