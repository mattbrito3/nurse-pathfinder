// Deno Edge Function - Password Reset
// Este arquivo é executado no ambiente Deno, não Node.js

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Tipos para melhorar a tipagem
interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string;
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para gerar template de email
function generateEmailTemplate(recoveryLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperar Senha - Dose Certa</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .link-fallback { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; font-size: 12px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Recuperar Senha</h1>
          <p>Dose Certa - Sua calculadora de medicamentos</p>
        </div>
        <div class="content">
          <h2>Olá!</h2>
          <p>Você solicitou a recuperação de sua senha no Dose Certa.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center;">
            <a href="${recoveryLink}" class="button">
              🔑 Redefinir Senha
            </a>
          </div>
          
          <p><strong>Este link expira em 1 hora.</strong></p>
          
          <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
          <div class="link-fallback">
            ${recoveryLink}
          </div>
          
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          
          <div class="footer">
            <p>Dose Certa - Calculadora de Medicamentos</p>
            <p>Se tiver problemas, verifique sua pasta de spam/lixo eletrônico.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Função para enviar email via Resend
async function sendEmailViaResend(email: string, recoveryLink: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('NEW_API_KEY_RESEND');
  
  if (!resendApiKey) {
    console.log('⚠️ Resend não configurado');
    return false;
  }

  try {
    const emailContent = generateEmailTemplate(recoveryLink);
    
    const emailPayload: ResendEmailPayload = {
      from: 'Dose Certa <team@dosecerta.online>',
      to: [email],
      subject: '🔒 Recuperar Senha - Dose Certa',
      html: emailContent
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (resendResponse.ok) {
      console.log('✅ Email customizado com link enviado via Resend para:', email);
      return true;
    } else {
      const errorData = await resendResponse.text();
      console.error('❌ Erro ao enviar email customizado:', errorData);
      return false;
    }
  } catch (resendError) {
    console.error('❌ Erro no Resend:', resendError);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório e deve ter formato válido' } as PasswordResetResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔒 Iniciando reset de senha para:', email);

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas');
      throw new Error('Configuração do servidor incompleta');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário existe primeiro
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Erro ao verificar usuários:', userError);
      throw new Error('Erro interno ao verificar usuário');
    }
    
    const userExists = userData.users.some(user => user.email === email);
    
    if (!userExists) {
      console.log('❌ Usuário não encontrado:', email);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se o email existir em nossa base, você receberá um link de recuperação.'
        } as PasswordResetResponse),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Gerar token de reset usando função do banco
    console.log('🔧 Gerando token para usuário existente:', email);
    
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('create_password_reset_token', { p_email: email });

    if (tokenError) {
      console.error('❌ Erro ao gerar token de reset:', tokenError);
      console.error('❌ Detalhes do erro:', JSON.stringify(tokenError, null, 2));
      throw new Error(`Erro ao gerar token: ${tokenError.message}`);
    }

    if (!tokenData || tokenData.length === 0) {
      console.error('❌ Token não gerado');
      throw new Error('Erro ao gerar token de reset');
    }

    const token = tokenData[0].token;
    const expiresAt = tokenData[0].expires_at;
    
    // Gerar link de recuperação com token customizado
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080';
    const recoveryLink = `${frontendUrl}/reset-password?token=${token}`;
    
    console.log('🔗 Link de recuperação gerado:', recoveryLink);
    console.log('⏰ Token expira em:', expiresAt);

    // Tentar enviar email via Resend primeiro
    const resendSuccess = await sendEmailViaResend(email, recoveryLink);

    if (!resendSuccess) {
      // Fallback: tentar novamente com Resend ou usar método alternativo
      console.log('⚠️ Resend falhou, tentando novamente...');
      
      // Tentar enviar novamente
      const retrySuccess = await sendEmailViaResend(email, recoveryLink);
      
      if (!retrySuccess) {
        console.error('❌ Falha ao enviar email via Resend');
        throw new Error('Erro ao enviar email de recuperação');
      }
    }

    console.log('✅ Reset de senha processado com sucesso para:', email);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Link de recuperação enviado para seu email.'
      } as PasswordResetResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro no reset de senha:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      } as PasswordResetResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 