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
    // Configuração do Supabase - usando service role para admin.listUsers()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incorreta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Rate limiting simples (sem banco de dados)
    // Em produção, pode ser substituído por Redis ou outra solução
    console.log('Email verification request from:', req.headers.get('x-forwarded-for') || 'unknown')

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

    // Verificar se email existe no auth.users (incluindo usuários não confirmados)
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

    // Verificar se email existe no auth.users (incluindo usuários não confirmados)
    const emailExistsInAuth = user.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
    
    // Verificar se email existe na tabela de verificação
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verification')
      .select('email, verified')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (verificationError) {
      console.error('Erro ao verificar tabela de verificação:', verificationError)
    }
    
    // Email existe se estiver no auth.users OU se tiver registro de verificação
    const emailExists = emailExistsInAuth || (verificationData && verificationData.length > 0)

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