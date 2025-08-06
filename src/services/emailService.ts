import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_nursepath';
const EMAILJS_TEMPLATE_ID = 'template_verification';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // We'll replace this

interface EmailData {
  to_email: string;
  verification_code: string;
  user_name?: string;
}

/**
 * Send verification email using EmailJS
 */
export const sendVerificationEmail = async (
  email: string, 
  code: string, 
  userName?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Initialize EmailJS (if not already done)
    if (!emailjs.init) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    const templateParams: EmailData = {
      to_email: email,
      verification_code: code,
      user_name: userName || 'Usuário'
    };

    console.log('📧 Sending real email to:', email);
    console.log('🔐 Code:', code);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log('✅ Email sent successfully!', response);
      return { success: true };
    } else {
      console.error('❌ Email send failed:', response);
      return { 
        success: false, 
        error: `Failed to send email: ${response.text}` 
      };
    }

  } catch (error: any) {
    console.error('❌ EmailJS Error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
};

/**
 * Send email using Mailgun (simple and reliable)
 */
export const sendVerificationEmailMailgun = async (
  email: string, 
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Using a simple email sending service
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'default_service',
        template_id: 'default',
        user_id: 'public_key',
        template_params: {
          to_email: email,
          subject: 'Código de Verificação - Dose Certa',
          message: `
🩺 Dose Certa

Olá! Seu código de verificação é:

${code}

Este código expira em 10 minutos.

Se você não solicitou este código, ignore este email.
          `
        }
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      throw new Error('Email service failed');
    }
  } catch (error) {
    console.warn('Email service failed:', error);
    return { 
      success: false, 
      error: 'Email service unavailable' 
    };
  }
};

/**
 * Send verification email with multiple fallbacks
 */
export const sendVerificationEmailWithFallbacks = async (
  email: string, 
  code: string, 
  userName?: string
): Promise<{ success: boolean; error?: string; method?: string }> => {
  
  // Method 1: Try EmailJS (most reliable)
  console.log('🔄 Trying EmailJS...');
  const emailjsResult = await sendVerificationEmail(email, code, userName);
  
  if (emailjsResult.success) {
    return { 
      success: true, 
      method: 'EmailJS' 
    };
  }

  // Method 2: Try FormSubmit fallback
  console.log('🔄 EmailJS failed, trying FormSubmit...');
  const fallbackResult = await sendVerificationEmailFallback(email, code);
  
  if (fallbackResult.success) {
    return { 
      success: true, 
      method: 'FormSubmit' 
    };
  }

  // Method 3: Web3Forms (another free service)
  console.log('🔄 Trying Web3Forms...');
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: 'YOUR_WEB3FORMS_KEY', // Free key needed
        subject: 'Código de Verificação - Dose Certa',
        email: email,
        message: `
          🩺 Dose Certa - Código de Verificação
          
          Olá ${userName || 'Usuário'}!
          
          Seu código de verificação é: ${code}
          
          Este código expira em 10 minutos.
          
          Se você não solicitou este código, ignore este email.
        `
      })
    });

    if (response.ok) {
      return { 
        success: true, 
        method: 'Web3Forms' 
      };
    }
  } catch (error) {
    console.error('Web3Forms failed:', error);
  }

  // All methods failed
  return { 
    success: false, 
    error: 'All email services failed. Please try again later.',
    method: 'none' 
  };
};
