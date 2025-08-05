// Deno Edge Function - Create Confirmed User
// Cria usuário já confirmado após verificação de email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Edge Function create-confirmed-user iniciada');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Processando requisição...');
    
    // Configuração do Supabase - usando service role para admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('🔧 Configuração:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey 
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incorreta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Cliente Supabase criado');

    // Obter dados da requisição
    const body = await req.json()
    console.log('📦 Dados recebidos:', { 
      email: body.email, 
      hasPassword: !!body.password, 
      fullName: body.fullName 
    });

    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      console.error('❌ Dados obrigatórios faltando');
      return new Response(
        JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Email inválido:', email);
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 Verificando se email já existe...');
    
    // Verificar se email já existe
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erro ao verificar usuários existentes:', listError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailExists = existingUsers.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
    console.log('📊 Usuários existentes:', existingUsers.users.length);
    console.log('🔍 Email existe:', emailExists);
    
    if (emailExists) {
      console.error('❌ Email já cadastrado:', email);
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('👤 Criando usuário...');
    
    // Criar usuário usando admin API
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: fullName
      }
    })

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Usuário criado com sucesso:', user.user?.email);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuário criado e confirmado com sucesso',
        user: {
          id: user.user?.id,
          email: user.user?.email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 