// Teste do Resend
const { Resend } = require('resend');

// Substitua pela sua API Key do Resend
const resend = new Resend('re_YOUR_API_KEY_HERE');

async function testResend() {
  try {
    console.log('🧪 Testando Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'noreply@nurse-pathfinder.vercel.app',
      to: ['teste@exemplo.com'],
      subject: 'Teste do Resend',
      html: '<p>Este é um teste do Resend</p>'
    });

    if (error) {
      console.error('❌ Erro no Resend:', error);
      return;
    }

    console.log('✅ Email enviado com sucesso:', data);
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testResend(); 