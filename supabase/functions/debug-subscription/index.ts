import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();
  
  console.log(`🚀 [${timestamp}] [${requestId}] Debug Subscription endpoint called!`)
  console.log(`📡 [${requestId}] Method:`, req.method)
  console.log(`📡 [${requestId}] URL:`, req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight request handled`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    console.log(`🔧 [${requestId}] Environment variables loaded`)
    console.log(`🔧 [${requestId}] Supabase URL:`, supabaseUrl)

    // Create Supabase client
    console.log(`🔗 [${requestId}] Creating Supabase client...`)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log(`✅ [${requestId}] Supabase client created successfully`)

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId');
    const paymentId = url.searchParams.get('paymentId');

    console.log(`📋 [${requestId}] Debug parameters:`, {
      action,
      userId,
      paymentId
    });

    switch (action) {
      case 'test-activation':
        return await testSubscriptionActivation(supabase, userId, requestId);
        
      case 'check-user':
        return await checkUserExists(supabase, userId, requestId);
        
      case 'list-plans':
        return await listSubscriptionPlans(supabase, requestId);
        
      case 'check-subscription':
        return await checkUserSubscription(supabase, userId, requestId);
        
      case 'simulate-payment':
        return await simulatePayment(supabase, userId, paymentId, requestId);
        
      case 'debug-webhook':
        return await debugWebhookData(supabase, paymentId, requestId);
        
      default:
        return await showDebugMenu(requestId);
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Debug endpoint error:`, error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        timestamp,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function showDebugMenu(requestId: string) {
  const menu = {
    title: "🔧 Debug Subscription System",
    description: "Endpoints para debug do sistema de assinaturas",
    requestId,
    endpoints: {
      "test-activation": {
        url: "?action=test-activation&userId=USER_UUID",
        description: "Testar ativação de plano para um usuário",
        params: ["userId (required)"]
      },
      "check-user": {
        url: "?action=check-user&userId=USER_UUID",
        description: "Verificar se usuário existe no sistema",
        params: ["userId (required)"]
      },
      "list-plans": {
        url: "?action=list-plans",
        description: "Listar todos os planos disponíveis",
        params: []
      },
      "check-subscription": {
        url: "?action=check-subscription&userId=USER_UUID",
        description: "Verificar assinatura atual do usuário",
        params: ["userId (required)"]
      },
      "simulate-payment": {
        url: "?action=simulate-payment&userId=USER_UUID&paymentId=PAYMENT_ID",
        description: "Simular recebimento de webhook de pagamento",
        params: ["userId (required)", "paymentId (optional)"]
      },
      "debug-webhook": {
        url: "?action=debug-webhook&paymentId=PAYMENT_ID",
        description: "Debug dados de um pagamento específico",
        params: ["paymentId (required)"]
      }
    },
    examples: {
      testActivation: "curl '${BASE_URL}/debug-subscription?action=test-activation&userId=12345678-1234-1234-1234-123456789012'",
      checkUser: "curl '${BASE_URL}/debug-subscription?action=check-user&userId=12345678-1234-1234-1234-123456789012'",
      listPlans: "curl '${BASE_URL}/debug-subscription?action=list-plans'",
      checkSubscription: "curl '${BASE_URL}/debug-subscription?action=check-subscription&userId=12345678-1234-1234-1234-123456789012'",
      simulatePayment: "curl '${BASE_URL}/debug-subscription?action=simulate-payment&userId=12345678-1234-1234-1234-123456789012&paymentId=12345678'"
    }
  };

  return new Response(
    JSON.stringify(menu, null, 2),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  );
}

async function testSubscriptionActivation(supabase: any, userId: string, requestId: string) {
  console.log(`🔄 [${requestId}] Testing subscription activation for user: ${userId}`);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "userId parameter is required" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    // Simular dados de pagamento aprovado
    const mockPaymentData = {
      id: `test-payment-${Date.now()}`,
      status: 'approved',
      external_reference: userId,
      transaction_amount: 18.99,
      payer: {
        email: `test-user-${userId}@dosecerta.online`
      },
      metadata: {
        debug_test: true,
        debug_request_id: requestId
      }
    };

    console.log(`📊 [${requestId}] Mock payment data:`, mockPaymentData);

    // Chamar função de atualização de assinatura
    await updateSubscriptionFromPayment(supabase, mockPaymentData, requestId);

    const result = {
      success: true,
      message: "Subscription activation test completed",
      userId,
      mockPaymentData,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error in subscription activation test:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        userId,
        requestId,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function checkUserExists(supabase: any, userId: string, requestId: string) {
  console.log(`🔍 [${requestId}] Checking if user exists: ${userId}`);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "userId parameter is required" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    // Verificar na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, created_at, updated_at')
      .eq('id', userId)
      .single();

    // Verificar na tabela auth.users (se permitido)
    let authData = null;
    try {
      const { data: authResult, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, created_at, email_confirmed_at')
        .eq('id', userId)
        .single();
      authData = { data: authResult, error: authError };
    } catch (authError) {
      authData = { data: null, error: "Cannot access auth.users table" };
    }

    const result = {
      userId,
      exists: !!profileData,
      profile: {
        data: profileData,
        error: profileError
      },
      auth: authData,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error checking user:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        userId,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function listSubscriptionPlans(supabase: any, requestId: string) {
  console.log(`📋 [${requestId}] Listing subscription plans`);

  try {
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    const result = {
      plans,
      error: plansError,
      planCount: plans?.length || 0,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error listing plans:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function checkUserSubscription(supabase: any, userId: string, requestId: string) {
  console.log(`📋 [${requestId}] Checking user subscription: ${userId}`);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "userId parameter is required" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          id, name, price, features, active
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const result = {
      userId,
      subscriptions,
      error: subscriptionError,
      subscriptionCount: subscriptions?.length || 0,
      hasActiveSubscription: subscriptions?.some(s => s.status === 'active') || false,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error checking subscription:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        userId,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function simulatePayment(supabase: any, userId: string, paymentId: string, requestId: string) {
  console.log(`💳 [${requestId}] Simulating payment webhook for user: ${userId}`);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "userId parameter is required" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    // Simular webhook payload do Mercado Pago
    const mockWebhookData = {
      type: 'payment',
      data: {
        id: paymentId || `sim-${Date.now()}`
      }
    };

    const mockPaymentData = {
      id: paymentId || `sim-${Date.now()}`,
      status: 'approved',
      external_reference: userId,
      transaction_amount: 18.99,
      payer: {
        email: `sim-user-${userId}@dosecerta.online`
      },
      date_approved: new Date().toISOString(),
      metadata: {
        simulation: true,
        debug_request_id: requestId
      }
    };

    console.log(`📨 [${requestId}] Simulating webhook with data:`, mockWebhookData);
    console.log(`💳 [${requestId}] Mock payment data:`, mockPaymentData);

    // Importar e chamar handlePayment
    const { handlePayment } = await import('./webhook-functions.ts');
    await handlePayment(supabase, mockPaymentData, requestId);

    const result = {
      success: true,
      message: "Payment webhook simulation completed",
      userId,
      paymentId: mockPaymentData.id,
      mockWebhookData,
      mockPaymentData,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error simulating payment:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        userId,
        paymentId,
        requestId,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function debugWebhookData(supabase: any, paymentId: string, requestId: string) {
  console.log(`🔍 [${requestId}] Debugging webhook data for payment: ${paymentId}`);

  if (!paymentId) {
    return new Response(
      JSON.stringify({ error: "paymentId parameter is required" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    // Buscar dados do pagamento no histórico
    const { data: paymentHistory, error: historyError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false });

    // Tentar buscar dados na API do MercadoPago
    let mpData = null;
    try {
      const accessToken = Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN');
      if (accessToken) {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          mpData = await response.json();
        } else {
          mpData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        mpData = { error: 'No access token available' };
      }
    } catch (mpError) {
      mpData = { error: mpError.message };
    }

    const result = {
      paymentId,
      paymentHistory: {
        data: paymentHistory,
        error: historyError,
        count: paymentHistory?.length || 0
      },
      mercadoPagoData: mpData,
      requestId,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Error debugging webhook data:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        paymentId,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Função auxiliar para atualização de assinatura (cópia da função principal)
async function updateSubscriptionFromPayment(supabase: any, paymentData: any, requestId: string = 'unknown') {
  console.log(`🔄 [${requestId}] Starting subscription update from payment...`);
  
  const { external_reference, transaction_amount, metadata } = paymentData
  
  console.log(`📊 [${requestId}] Payment data for subscription:`, {
    external_reference,
    transaction_amount,
    metadata,
    external_reference_type: typeof external_reference
  });

  // **PONTO CRÍTICO: BUSCA DE PLANO**
  console.log(`🔍 [${requestId}] Looking for subscription plan based on amount: ${transaction_amount}`);
  
  let planId;
  
  console.log(`🔍 [${requestId}] Determining plan type based on transaction amount...`);
  console.log(`💰 [${requestId}] Transaction amount: ${transaction_amount} (type: ${typeof transaction_amount})`);
  
  // Se o valor for maior que 0, buscar plano pago
  if (transaction_amount > 0) {
    console.log(`💰 [${requestId}] Searching for paid plan (amount > 0)...`);
    
    const { data: paidPlans, error: paidPlanError } = await supabase
      .from('subscription_plans')
      .select('id, name, price')
      .eq('active', true)
      .gt('price', 0) // Apenas planos pagos
      .order('price', { ascending: true })
      .limit(1);

    console.log(`📊 [${requestId}] Paid plans query result:`, {
      error: paidPlanError,
      plansFound: paidPlans?.length || 0,
      plans: paidPlans
    });

    if (paidPlanError) {
      console.error(`❌ [${requestId}] Error fetching paid subscription plans:`, paidPlanError);
      throw paidPlanError;
    }

    if (paidPlans && paidPlans.length > 0) {
      planId = paidPlans[0].id;
      console.log(`✅ [${requestId}] Found paid plan:`, { 
        id: planId, 
        name: paidPlans[0].name, 
        price: paidPlans[0].price 
      });
    } else {
      console.error(`❌ [${requestId}] No paid subscription plans found`);
      throw new Error('No paid subscription plans available');
    }
  } else {
    console.log(`🆓 [${requestId}] Searching for free plan (amount = 0)...`);
    
    // Se o valor for 0, buscar plano gratuito
    const { data: freePlans, error: freePlanError } = await supabase
      .from('subscription_plans')
      .select('id, name, price')
      .eq('active', true)
      .eq('price', 0) // Apenas plano gratuito
      .limit(1);

    console.log(`📊 [${requestId}] Free plans query result:`, {
      error: freePlanError,
      plansFound: freePlans?.length || 0,
      plans: freePlans
    });

    if (freePlanError) {
      console.error(`❌ [${requestId}] Error fetching free subscription plans:`, freePlanError);
      throw freePlanError;
    }

    if (freePlans && freePlans.length > 0) {
      planId = freePlans[0].id;
      console.log(`✅ [${requestId}] Found free plan:`, { 
        id: planId, 
        name: freePlans[0].name, 
        price: freePlans[0].price 
      });
    } else {
      console.error(`❌ [${requestId}] No free subscription plans found`);
      throw new Error('No free subscription plans available');
    }
  }

  // **PONTO MAIS CRÍTICO: ATUALIZAÇÃO DA ASSINATURA**
  console.log(`📝 [${requestId}] Updating user subscription...`);
  console.log(`📝 [${requestId}] Subscription data to save:`, {
    user_id: external_reference,
    plan_id: planId,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  const { data: subscriptionData, error: updateError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference,
      plan_id: planId, // Usar o UUID correto
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();

  console.log(`📊 [${requestId}] Subscription update result:`, {
    error: updateError,
    data: subscriptionData
  });

  if (updateError) {
    console.error(`❌ [${requestId}] CRITICAL ERROR updating subscription from payment:`, updateError);
    console.error(`❌ [${requestId}] Subscription update error details:`, {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint
    });
    throw updateError
  }

  console.log(`✅ [${requestId}] Subscription updated from payment successfully!`);
  console.log(`📊 [${requestId}] Updated subscription data:`, subscriptionData);
}