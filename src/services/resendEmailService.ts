/**
 * 📧 RESEND EMAIL SERVICE - REAL EMAILS TO INBOX
 * Using Resend API for actual email delivery
 */

interface EmailResponse {
  success: boolean;
  method?: string;
  error?: string;
  emailId?: string;
}

// ⚠️ SUBSTITUA PELA SUA API KEY QUANDO CRIAR
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z'; // MUDE AQUI
const FROM_EMAIL = 'delivered@resend.dev'; // Domínio de teste (funciona sem configuração)

/**
 * 🚀 Send real email using Resend API
 */
export const sendRealEmail = async (
  email: string,
  code: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    console.log('🚀 Sending REAL email via Resend...');
    console.log('📧 To:', email);
    console.log('🔐 Code:', code);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: '🩺 Código de Verificação - Dose Certa',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificação</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🩺 Dose Certa</h1>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Plataforma de Estudos para Enfermagem</p>
        </div>

        <!-- Main Content -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Código de Verificação</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Olá <strong>${userName || 'Usuário'}</strong>! 👋<br>
                Use o código abaixo para verificar sua conta:
            </p>
            
            <!-- Verification Code -->
            <div style="background-color: #f1f5f9; border: 2px dashed #2563eb; border-radius: 8px; padding: 30px; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace;">
                    ${code}
                </div>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin: 20px 0 0 0;">
                ⏰ Este código expira em <strong>10 minutos</strong>
            </p>
        </div>

        <!-- Instructions -->
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📋 Como usar:</h3>
            <ol style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Volte para a página de verificação</li>
                <li>Digite o código de 6 dígitos acima</li>
                <li>Clique em "Verificar"</li>
                <li>Sua conta será ativada!</li>
            </ol>
        </div>

        <!-- Security Notice -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                🔒 <strong>Segurança:</strong> Se você não solicitou este código, ignore este email. 
                Nunca compartilhe seus códigos de verificação com terceiros.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 Dose Certa - Transformando o estudo de enfermagem
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🩺 Dose Certa - Código de Verificação

Olá ${userName || 'Usuário'}!

Seu código de verificação é: ${code}

Este código expira em 10 minutos.

Como usar:
1. Volte para a página de verificação
2. Digite o código: ${code}
3. Clique em "Verificar"
4. Sua conta será ativada!

Se você não solicitou este código, ignore este email.

---
© 2024 Dose Certa
Plataforma de Estudos para Enfermagem
        `
      })
    });

    const result = await response.json();

    if (response.ok && result.id) {
      console.log('✅ REAL EMAIL SENT! Email ID:', result.id);
      return {
        success: true,
        method: 'Resend API',
        emailId: result.id
      };
    } else {
      console.error('❌ Resend API error:', result);
      return {
        success: false,
        error: result.message || 'Resend API failed',
        method: 'Resend API'
      };
    }

  } catch (error: any) {
    console.error('❌ Resend API exception:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      method: 'Resend API'
    };
  }
};

/**
 * 📧 Fallback using browser email client
 */
export const sendViaBrowserClient = async (
  email: string,
  code: string,
  userName?: string
): Promise<EmailResponse> => {
  try {
    const subject = '🩺 Código de Verificação - Dose Certa';
    const body = `
Olá ${userName || 'Usuário'}!

Seu código de verificação é: ${code}

Este código expira em 10 minutos.

Copie o código acima e cole na aplicação para continuar.

---
Dose Certa
Plataforma de Estudos para Enfermagem
    `.trim();

    const mailtoURL = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
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
      error: error.message || 'Browser client failed'
    };
  }
};

/**
 * 🏆 MAIN EMAIL FUNCTION - REAL DELIVERY
 */
export const sendVerificationEmailReal = async (
  email: string,
  code: string,
  userName?: string
): Promise<EmailResponse> => {
  console.log('🚀 SENDING REAL EMAIL TO INBOX...');
  console.log('📧 Target:', email);
  console.log('🔐 Code:', code);
  console.log('🎯 Using Resend API...');

  // Primary: Resend API (real email delivery)
  const resendResult = await sendRealEmail(email, code, userName);
  
  if (resendResult.success) {
    console.log('🎉 SUCCESS! Real email sent to inbox!');
    console.log('📧 Email ID:', resendResult.emailId);
    return resendResult;
  }

  console.log('⚠️ Resend failed, trying browser fallback...');
  
  // Fallback: Browser email client
  const browserResult = await sendViaBrowserClient(email, code, userName);
  
  if (browserResult.success) {
    console.log('✅ Browser email client opened as fallback');
    return browserResult;
  }

  // Final fallback (should never happen)
  return {
    success: false,
    error: 'All email methods failed',
    method: 'none'
  };
};

/**
 * 🧪 Test the real email service
 */
export const testRealEmailService = async (): Promise<void> => {
  console.log('🧪 Testing REAL email service...');
  
  const result = await sendVerificationEmailReal(
    'test@example.com',
    '123456',
    'Test User'
  );
  
  console.log('🧪 Test result:', result);
};
