// Deno Edge Function - Check Email Exists
// Este arquivo é executado no ambiente Deno, não Node.js

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting - verificar se não excedeu tentativas
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `email_check:${clientIP}`
    
    // Configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar rate limiting
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('attempts, last_attempt')
      .eq('key', rateLimitKey)
      .single()

    const now = new Date()
    const maxAttempts = 10 // Máximo 10 tentativas por hora
    const windowMs = 60 * 60 * 1000 // 1 hora

    if (rateLimitData) {
      const timeDiff = now.getTime() - new Date(rateLimitData.last_attempt).getTime()
      
      if (timeDiff < windowMs && rateLimitData.attempts >= maxAttempts) {
        return new Response(
          JSON.stringify({ 
            error: 'Muitas tentativas. Tente novamente em alguns minutos.',
            code: 'RATE_LIMIT_EXCEEDED'
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Atualizar rate limiting
    if (rateLimitData) {
      await supabase
        .from('rate_limits')
        .update({ 
          attempts: rateLimitData.attempts + 1,
          last_attempt: now.toISOString()
        })
        .eq('key', rateLimitKey)
    } else {
      await supabase
        .from('rate_limits')
        .insert({ 
          key: rateLimitKey,
          attempts: 1,
          last_attempt: now.toISOString()
        })
    }

    // Obter dados da requisição
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se email existe no auth.users
    const { data: user, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Erro ao verificar usuários:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailExists = user.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

    // Resposta segura - não revelar se email existe ou não
    if (emailExists) {
      return new Response(
        JSON.stringify({ 
          message: 'Este email já está em uso. Tente fazer login ou recuperar sua senha.',
          code: 'EMAIL_EXISTS',
          suggestions: ['login', 'forgot_password']
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          message: 'Email disponível para cadastro.',
          code: 'EMAIL_AVAILABLE'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 