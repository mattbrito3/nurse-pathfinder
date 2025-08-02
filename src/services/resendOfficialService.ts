/**
 * 📧 RESEND OFFICIAL SERVICE - Following Resend Documentation
 * Using Resend SDK with React templates
 */

import { Resend } from 'resend';
import { VerificationEmailTemplate } from '@/components/EmailTemplate';

// Your API Key
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z';

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

interface EmailResponse {
  success: boolean;
  method?: string;
  error?: string;
  emailId?: string;
}

/**
 * 🚀 Send verification email using official Resend approach
 */
export const sendVerificationEmail = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    console.log('🚀 Sending email via Official Resend SDK...');
    console.log('📧 To:', userEmail);
    console.log('🔐 Code:', verificationCode);
    console.log('👤 User:', userName);

    console.log('📤 Sending email with parameters:');
    console.log('- From:', 'Nurse Pathfinder <onboarding@resend.dev>');
    console.log('- To:', [userEmail]);
    console.log('- Subject:', '🩺 Código de Verificação - Nurse Pathfinder');
    console.log('- React Template:', 'VerificationEmailTemplate');

    const { data, error } = await resend.emails.send({
      from: 'Nurse Pathfinder <onboarding@resend.dev>',
      to: [userEmail], // 📧 EMAIL DO USUÁRIO AQUI
      subject: '🩺 Código de Verificação - Nurse Pathfinder',
      react: VerificationEmailTemplate({ 
        firstName: userName || 'Usuário',
        verificationCode: verificationCode
      }),
    });

    console.log('📤 Resend API Response:');
    console.log('- Data:', data);
    console.log('- Error:', error);

    if (error) {
      console.error('❌ RESEND ERROR DETAILS:');
      console.error('- Error object:', error);
      console.error('- Error message:', error.message);
      console.error('- Error name:', error.name);
      console.error('- Full error:', JSON.stringify(error, null, 2));
      
      return {
        success: false,
        error: `Resend Error: ${error.message || JSON.stringify(error)}`,
        method: 'Resend SDK'
      };
    }

    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('✅ Email ID:', data?.id);
    console.log('✅ Full response:', data);
    
    return {
      success: true,
      method: 'Resend SDK',
      emailId: data?.id
    };

  } catch (error: any) {
    console.error('❌ Resend SDK exception:', error);
    return {
      success: false,
      error: error.message || 'SDK error',
      method: 'Resend SDK'
    };
  }
};

/**
 * 📧 Fallback using browser email client
 */
export const sendViaBrowserFallback = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    const subject = '🩺 Código de Verificação - Nurse Pathfinder';
    const body = `
Olá ${userName || 'Usuário'}!

Seu código de verificação é: ${verificationCode}

Este código expira em 10 minutos.

---
Nurse Pathfinder
    `.trim();

    const mailtoURL = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (typeof window !== 'undefined') {
      window.open(mailtoURL, '_blank');
    }
    
    return {
      success: true,
      method: 'Browser Email Client'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Browser fallback failed'
    };
  }
};

/**
 * 🏆 MAIN EMAIL FUNCTION - ONLY Resend (NO FALLBACKS)
 */
export const sendOfficialVerificationEmail = async (
  userEmail: string,
  verificationCode: string,
  userName?: string
): Promise<EmailResponse> => {
  console.log('🚀 STARTING OFFICIAL RESEND EMAIL SEND...');
  console.log('📧 Target:', userEmail);
  console.log('🔐 Code:', verificationCode);
  console.log('👤 Name:', userName);

  // ONLY Official Resend SDK - NO FALLBACKS
  const resendResult = await sendVerificationEmail(userEmail, verificationCode, userName);
  
  if (resendResult.success) {
    console.log('🎉 SUCCESS! Official Resend email sent!');
    console.log('📧 Email ID:', resendResult.emailId);
    return resendResult;
  }

  // NO FALLBACK - Just return the error
  console.error('❌ RESEND FAILED - NO FALLBACKS ACTIVATED');
  console.error('❌ Error:', resendResult.error);
  
  return {
    success: false,
    error: resendResult.error || 'Resend failed',
    method: 'Resend SDK Only'
  };
};

/**
 * 🧪 Test the official email service
 */
export const testOfficialEmailService = async (): Promise<void> => {
  console.log('🧪 Testing OFFICIAL Resend email service...');
  
  const result = await sendOfficialVerificationEmail(
    'test@example.com',
    '123456',
    'Test User'
  );
  
  console.log('🧪 Test result:', result);
};