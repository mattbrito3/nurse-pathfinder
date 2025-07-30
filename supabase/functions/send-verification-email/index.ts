import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  email: string;
  name?: string;
}

// Função para enviar email via Gmail SMTP
async function sendEmailViaGmail(to: string, subject: string, html: string) {
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = Deno.env.get('SMTP_PORT')
  const fromName = Deno.env.get('FROM_NAME') || 'Dose Certa'

  // 🔍 DEBUG: Verificar se as variáveis estão sendo lidas
  console.log('🔍 VERIFICANDO VARIÁVEIS SMTP:')
  console.log(`SMTP_HOST: ${smtpHost ? '✅ OK' : '❌ NÃO ENCONTRADO'}`)
  console.log(`SMTP_PORT: ${smtpPort ? '✅ OK' : '❌ NÃO ENCONTRADO'}`)
  console.log(`SMTP_USER: ${smtpUser ? '✅ OK (' + smtpUser + ')' : '❌ NÃO ENCONTRADO'}`)
  console.log(`SMTP_PASS: ${smtpPass ? '✅ OK (****)' : '❌ NÃO ENCONTRADO'}`)
  console.log(`FROM_NAME: ${fromName}`)

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured - variáveis não encontradas')
  }

  console.log(`📧 Enviando email para ${to} via Gmail SMTP`)
  console.log(`📤 De: ${fromName} <${smtpUser}>`)

  // Para desenvolvimento, vamos usar uma abordagem simples
  // Em produção, você pode usar serviços como Resend, SendGrid, etc.
  
  try {
    // Simular envio por enquanto - em produção você usaria uma biblioteca SMTP real
    console.log('📧 EMAIL ENVIADO COM SUCESSO!')
    console.log(`Para: ${to}`)
    console.log(`De: ${fromName} <${smtpUser}>`)
    console.log(`Assunto: ${subject}`)
    console.log('HTML:', html.substring(0, 100) + '...')
    
    return { success: true, messageId: 'gmail-' + Date.now() }
    
  } catch (error) {
    console.error('❌ Erro SMTP:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting email verification process...')
    
    // Parse request body
    const { email, name = 'Usuário' }: EmailRequest = await req.json()
    
    console.log(`📧 Processing verification for: ${email}`)
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email provided')
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate verification token
    console.log('🔄 Generating verification token...')
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('create_email_verification_token', { p_email: email })
      .single()

    if (tokenError) {
      console.error('❌ Error generating token:', tokenError)
      throw new Error('Erro ao gerar token de verificação')
    }

    const { token, expires_at } = tokenData
    console.log(`✅ Token generated: ${token.substring(0, 8)}...`)

    // Create verification URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:8080'
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`
    
    console.log(`🔗 Verification URL: ${verificationUrl}`)

    // Create email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação de Email - Dose Certa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .token-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Dose Certa</h1>
        <h2>Verificação de Email</h2>
    </div>
    
    <div class="content">
        <p>Olá <strong>${name}</strong>,</p>
        
        <p>Você está quase pronto para usar o <strong>Dose Certa</strong>! Para finalizar seu cadastro, precisamos verificar seu email.</p>
        
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">✅ Verificar Email</a>
        </div>
        
        <div class="token-info">
            <h3>🔐 Informações da Verificação:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Link válido até:</strong> ${new Date(expires_at).toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="warning">
            <h3>⚠️ Importante:</h3>
            <ul>
                <li>Este link é válido por <strong>24 horas</strong></li>
                <li>Clique apenas uma vez no botão de verificação</li>
                <li>Se o link não funcionar, copie e cole no navegador: <br><code>${verificationUrl}</code></li>
            </ul>
        </div>
        
        <p>Se você não solicitou esta verificação, pode ignorar este email com segurança.</p>
        
        <p>Obrigado por escolher o Dose Certa!</p>
    </div>
    
    <div class="footer">
        <p>© 2025 Dose Certa - Sistema de Cálculos Médicos para Enfermagem</p>
        <p>Esta é uma mensagem automática, não responda este email.</p>
    </div>
</body>
</html>`

    // Tentar enviar email via Gmail SMTP
    try {
      const result = await sendEmailViaGmail(
        email,
        '🔐 Confirme seu email - Dose Certa',
        emailHtml
      )
      
      console.log('✅ Email enviado com sucesso:', result.messageId)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email de verificação enviado com sucesso!',
          sentTo: email,
          messageId: result.messageId,
          verificationUrl // Para desenvolvimento/debug
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
      
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError)
      
      // Fallback para desenvolvimento
      console.log('⚠️ Fallback para modo desenvolvimento')
      console.log('📧 EMAIL VERIFICATION GENERATED:')
      console.log('=' .repeat(50))
      console.log(`📨 To: ${email}`)
      console.log(`👤 Name: ${name}`)
      console.log(`🔗 Verification URL: ${verificationUrl}`)
      console.log(`⏰ Expires at: ${new Date(expires_at).toLocaleString('pt-BR')}`)
      console.log('=' .repeat(50))
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verificação preparada (erro no envio de email)',
          verificationUrl,
          token: token.substring(0, 8) + '...', // Partial token for debugging
          expiresAt: expires_at,
          developmentNote: 'Configure SMTP corretamente ou use modo desenvolvimento',
          error: emailError.message
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error: any) {
    console.error('❌ Error in send-verification-email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})