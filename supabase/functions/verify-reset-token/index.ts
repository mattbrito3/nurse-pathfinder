// Deno Edge Function - Verify Reset Token
// Esta função valida o token de reset de senha e processa a mudança

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log('🔄 Starting password reset token verification...');
    
    // Parse request body
    const body: ResetPasswordRequest = await req.json();
    const { token, newPassword } = body;
    
    if (!token) {
      console.error('❌ Token não fornecido');
      return new Response(JSON.stringify({
        success: false,
        message: 'Token de reset não fornecido'
      } as ResetPasswordResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!newPassword) {
      console.error('❌ Nova senha não fornecida');
      return new Response(JSON.stringify({
        success: false,
        message: 'Nova senha é obrigatória'
      } as ResetPasswordResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é apenas validação ou processamento real
    const isValidationOnly = newPassword === 'temp_validation_only';
    
    // Validar força da senha apenas se não for validação
    if (!isValidationOnly && newPassword.length < 8) {
      return new Response(JSON.stringify({
        success: false,
        message: 'A senha deve ter pelo menos 8 caracteres'
      } as ResetPasswordResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Verificando token: ${token.substring(0, 8)}...`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas');
      return new Response(JSON.stringify({
        success: false,
        message: 'Erro de configuração do servidor'
      } as ResetPasswordResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validar token usando a função do banco
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_reset_token', { p_token: token });

    if (validationError) {
      console.error('❌ Erro ao validar token:', validationError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erro interno ao validar token'
      } as ResetPasswordResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!validationData || validationData.length === 0) {
      console.error('❌ Token inválido');
      return new Response(JSON.stringify({
        success: false,
        message: 'Token de reset inválido'
      } as ResetPasswordResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const validation = validationData[0];
    
    if (!validation.valid) {
      console.error('❌ Token inválido:', validation.message);
      return new Response(JSON.stringify({
        success: false,
        message: validation.message
      } as ResetPasswordResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Token válido para:', validation.email);

    // Buscar usuário pelo email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Erro ao buscar usuários:', userError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erro interno do servidor'
      } as ResetPasswordResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = users.users.find(u => u.email?.toLowerCase() === validation.email.toLowerCase());

    if (!user) {
      console.error('❌ Usuário não encontrado:', validation.email);
      return new Response(JSON.stringify({
        success: false,
        message: 'Usuário não encontrado'
      } as ResetPasswordResponse), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (isValidationOnly) {
      // Apenas validação, não processar senha
      console.log('✅ Token válido para validação');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Token válido',
        email: validation.email
      } as ResetPasswordResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('👤 Usuário encontrado, atualizando senha...');

    // Atualizar senha do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError);
      return new Response(JSON.stringify({
        success: false,
        message: updateError.message || 'Erro ao atualizar senha'
      } as ResetPasswordResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Marcar token como usado
    const { error: markError } = await supabase
      .rpc('mark_reset_token_used', { p_token: token });

    if (markError) {
      console.error('❌ Erro ao marcar token como usado:', markError);
      // Não falhar aqui, a senha já foi atualizada
    }

    console.log('✅ Senha atualizada com sucesso');

    return new Response(JSON.stringify({
      success: true,
      message: 'Senha atualizada com sucesso!',
      email: validation.email
    } as ResetPasswordResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in verify-reset-token:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    } as ResetPasswordResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 