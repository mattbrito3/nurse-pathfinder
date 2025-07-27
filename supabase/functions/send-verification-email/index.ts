import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, code, type } = await req.json()

    // Validate input
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email templates
    const getEmailContent = (code: string, type: string) => {
      if (type === 'email_verification') {
        return {
          subject: 'Código de Verificação - Nurse Pathfinder',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0;">🩺 Nurse Pathfinder</h1>
                <p style="color: #6b7280; margin: 5px 0;">Plataforma de Estudos para Enfermagem</p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
                <h2 style="color: #1e293b; margin-bottom: 20px;">Código de Verificação</h2>
                <p style="color: #475569; margin-bottom: 25px;">
                  Use o código abaixo para verificar seu email:
                </p>
                
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px;">
                    ${code}
                  </span>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                  Este código expira em 10 minutos por segurança.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #9ca3af; font-size: 12px;">
                  Se você não solicitou este código, ignore este email.
                </p>
              </div>
            </div>
          `
        }
      }
      
      return {
        subject: 'Código de Verificação',
        html: `<p>Seu código: <strong>${code}</strong></p>`
      }
    }

    const emailContent = getEmailContent(code, type)

    // Send email using Resend (if API key is available)
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Nurse Pathfinder <noreply@nursepathfinder.com>',
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Resend API error:', errorData)
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email',
            details: errorData 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await response.json()
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.id,
          message: 'Email sent successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Fallback: Log to console (development mode)
      console.log(`📧 EMAIL TO: ${email}`)
      console.log(`🔐 CODE: ${code}`)
      console.log(`📝 SUBJECT: ${emailContent.subject}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged to console (dev mode)',
          code: code // For development only
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})