// Deno Edge Function - Verify Email Token
// Esta função verifica o token de email e confirma o usuário

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log('🔄 Starting email token verification...');
    
    // Parse request body
    const body = await req.json();
    const { token } = body;
    
    if (!token) {
      console.error('❌ Token não fornecido');
      return new Response(JSON.stringify({
        success: false,
        message: 'Token de verificação não fornecido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Verificando token: ${token.substring(0, 8)}...`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar token na tabela email_verification
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verification')
      .select('*')
      .eq('token', token)
      .single();

    if (verificationError || !verificationData) {
      console.error('❌ Token não encontrado:', verificationError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Token de verificação inválido'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Token encontrado:', verificationData.email);

    // Verificar se já foi verificado
    if (verificationData.verified) {
      console.log('⚠️ Email já verificado');
      return new Response(JSON.stringify({
        success: false,
        message: 'Email já foi verificado',
        email: verificationData.email
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se expirou
    if (new Date(verificationData.expires_at) < new Date()) {
      console.error('❌ Token expirado');
      // Limpar token expirado
      await supabase
        .from('email_verification')
        .delete()
        .eq('id', verificationData.id);

      return new Response(JSON.stringify({
        success: false,
        message: 'Token expirado. Solicite uma nova verificação',
        email: verificationData.email
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se usuário já existe em auth.users
    const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Erro ao verificar usuários:', userError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erro interno do servidor'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = existingUser.users.find(u => u.email?.toLowerCase() === verificationData.email.toLowerCase());

    if (user) {
      // Usuário existe, apenas confirmar email
      console.log('👤 Usuário existe, confirmando email...');
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (updateError) {
        console.error('❌ Erro ao confirmar usuário:', updateError);
        return new Response(JSON.stringify({
          success: false,
          message: 'Erro ao confirmar usuário'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Usuário confirmado com sucesso');
    } else {
      // Usuário não existe, criar novo
      console.log('👤 Criando novo usuário...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: verificationData.email,
        password: verificationData.user_password,
        email_confirm: true,
        user_metadata: {
          full_name: verificationData.user_full_name
        }
      });

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        return new Response(JSON.stringify({
          success: false,
          message: createError.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Usuário criado e confirmado:', newUser.user?.email);
    }

    // Marcar como verificado na tabela email_verification
    const { error: updateVerificationError } = await supabase
      .from('email_verification')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationData.id);

    if (updateVerificationError) {
      console.error('❌ Erro ao atualizar verificação:', updateVerificationError);
      // Não falhar aqui, o usuário já foi confirmado
    }

    console.log('✅ Verificação concluída com sucesso');

    return new Response(JSON.stringify({
      success: true,
      message: 'Email verificado com sucesso!',
      email: verificationData.email
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in verify-email-token:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro interno do servidor',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 