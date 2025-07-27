/**
 * 📧 PRODUCTION EMAIL SERVICE - Using dosecerta.online domain
 * Real production-ready Resend integration
 */

import { Resend } from 'resend';
import { VerificationEmailTemplate } from '@/components/EmailTemplate';

// Production Configuration - EXACT match with your Supabase setup
const RESEND_API_KEY = 're_auJbm1rY_AmScYpyomnG81PeHCGsRcq8v';
const FROM_EMAIL = 'dosecertasmtp <team@dosecerta.online>'; // EXACT match with Supabase
const DOMAIN = 'dosecerta.online';

// Initialize Resend with your API key
const resend = new Resend(RESEND_API_KEY);

interface EmailResponse {
  success: boolean;
  method?: string;
  error?: string;
  emailId?: string;
}

/**
 * 🚀 Send verification email using YOUR domain
 */
export const sendProductionEmail = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    console.log('🚀 Sending PRODUCTION email...');
    console.log('📧 To:', userEmail);
    console.log('🔐 Code:', verificationCode);
    console.log('👤 User:', userName);
    console.log('🌐 Domain:', DOMAIN);
    console.log('📨 From:', FROM_EMAIL);

    // Send using your verified domain
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL, // Your verified domain
      to: [userEmail],
      subject: '🩺 Código de Verificação - Dose Certa',
      react: VerificationEmailTemplate({ 
        firstName: userName || 'Usuário',
        verificationCode: verificationCode
      }),
      // Optional: Add reply-to (using same as from for consistency)
      reply_to: 'team@dosecerta.online',
      // Optional: Add tags for tracking
      tags: [
        {
          name: 'category',
          value: 'verification'
        },
        {
          name: 'user_type', 
          value: 'nurse'
        }
      ]
    });

    console.log('📤 Resend API Response:');
    console.log('- Data:', data);
    console.log('- Error:', error);

    if (error) {
      console.error('❌ PRODUCTION EMAIL ERROR:');
      console.error('- Error:', error);
      console.error('- Message:', error.message);
      console.error('- Full error:', JSON.stringify(error, null, 2));
      
      return {
        success: false,
        error: `Production Email Error: ${error.message}`,
        method: 'Production Resend'
      };
    }

    console.log('✅ PRODUCTION EMAIL SENT SUCCESSFULLY!');
    console.log('✅ Email ID:', data?.id);
    console.log('✅ From domain:', DOMAIN);
    
    return {
      success: true,
      method: 'Production Resend',
      emailId: data?.id
    };

  } catch (error: any) {
    console.error('❌ Production email exception:', error);
    return {
      success: false,
      error: `Exception: ${error.message}`,
      method: 'Production Resend'
    };
  }
};

/**
 * 🔄 Send password reset email
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  resetLink: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    console.log('🔄 Sending PASSWORD RESET email...');
    console.log('📧 To:', userEmail);
    console.log('🔗 Reset Link:', resetLink);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: '🔒 Redefinir Senha - Dose Certa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🩺 Dose Certa</h1>
          <h2>Redefinir Senha</h2>
          <p>Olá ${userName || 'Usuário'}!</p>
          <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p><strong>Este link expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2024 Dose Certa - Plataforma de Estudos para Enfermagem</p>
        </div>
      `,
      tags: [
        {
          name: 'category',
          value: 'password_reset'
        }
      ]
    });

    if (error) {
      console.error('❌ Password reset email error:', error);
      return {
        success: false,
        error: error.message,
        method: 'Production Resend'
      };
    }

    console.log('✅ Password reset email sent!', data?.id);
    return {
      success: true,
      method: 'Production Resend',
      emailId: data?.id
    };

  } catch (error: any) {
    console.error('❌ Password reset exception:', error);
    return {
      success: false,
      error: error.message,
      method: 'Production Resend'
    };
  }
};

/**
 * 🏆 MAIN PRODUCTION EMAIL FUNCTION
 */
export const sendProductionVerificationEmail = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  console.log('🚀 STARTING PRODUCTION EMAIL SEND...');
  console.log('🌐 Using domain:', DOMAIN);
  console.log('📧 Target:', userEmail);
  console.log('🔐 Code:', verificationCode);

  // Send using production configuration
  const result = await sendProductionEmail(userEmail, verificationCode, userName);
  
  if (result.success) {
    console.log('🎉 SUCCESS! Production email sent to real inbox!');
    console.log('📧 Email will arrive at:', userEmail);
    console.log('📨 From:', FROM_EMAIL);
    return result;
  }

  console.error('❌ PRODUCTION EMAIL FAILED');
  console.error('❌ Error:', result.error);
  
  return result;
};

/**
 * 🧪 Test production email service
 */
export const testProductionEmailService = async (): Promise<void> => {
  console.log('🧪 Testing PRODUCTION email service...');
  console.log('🌐 Domain:', DOMAIN);
  console.log('📨 From:', FROM_EMAIL);
  
  const result = await sendProductionVerificationEmail(
    'test@example.com',
    '123456',
    'Test User'
  );
  
  console.log('🧪 Test result:', result);
};