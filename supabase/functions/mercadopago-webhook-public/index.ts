// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função REST para obter detalhes do pagamento (SDK não é compatível com Edge Runtime)
async function fetchPaymentDetails(paymentId: string): Promise<any> {
  console.log('🔍 Fetching payment details for ID:', paymentId);
  
  const accessToken = Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN');
  if (!accessToken) {
    console.error('❌ Missing MercadoPago access token');
    throw new Error('Missing MercadoPago access token');
  }
  
  console.log('🔑 Access token loaded:', accessToken.substring(0, 10) + '...');
  
  const apiUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  console.log('🌐 API URL:', apiUrl);
  
  try {
    const resp = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', resp.status);
    console.log('📡 Response headers:', Object.fromEntries(resp.headers.entries()));
    
    if (!resp.ok) {
      const text = await resp.text();
      console.error('❌ API Error Response:', text);
      
      // Se for 404, pode ser que o pagamento ainda não esteja disponível
      if (resp.status === 404) {
        console.log('⚠️ Payment not found (404) - may still be processing');
        // Retornar dados básicos para continuar o processamento
        return {
          id: paymentId,
          status: 'pending',
          external_reference: null,
          transaction_amount: 0,
          payer: null,
          date_approved: null
        };
      }
      
      throw new Error(`MercadoPago payments fetch error: ${resp.status} - ${text}`);
    }
    
    const paymentData = await resp.json();
    console.log('✅ Payment data fetched successfully:', JSON.stringify(paymentData, null, 2));
    return paymentData;
    
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    
    // Se for erro de rede ou timeout, retornar dados básicos
    if (error.message.includes('fetch') || error.message.includes('timeout')) {
      console.log('⚠️ Network error - returning basic payment data');
      return {
        id: paymentId,
        status: 'pending',
        external_reference: null,
        transaction_amount: 0,
        payer: null,
        date_approved: null
      };
    }
    
    throw error;
  }
}

// Função para verificar a assinatura do Mercado Pago
async function verifyMercadoPagoSignature(request: Request, body: string): Promise<boolean> {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  
  if (!xSignature || !xRequestId) {
    console.log('⚠️ Missing x-signature or x-request-id header');
    return false;
  }

  const signatureParts = xSignature.split(",");
  let ts = "";
  let v1 = "";
  
  signatureParts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key.trim() === "ts") {
      ts = value.trim();
    } else if (key.trim() === "v1") {
      v1 = value.trim();
    }
  });

  if (!ts || !v1) {
    console.log('⚠️ Invalid x-signature header format');
    return false;
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  let manifest = "";
  if (dataId) {
    manifest += `id:${dataId};`;
  }
  if (xRequestId) {
    manifest += `request-id:${xRequestId};`;
  }
  manifest += `ts:${ts};`;

  const secret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') as string;
  
  // Criar HMAC SHA256
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(manifest);
  
  // Usar Web Crypto API para criar HMAC
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  const generatedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (generatedHash !== v1) {
    console.log('⚠️ Invalid signature');
    return false;
  }
  
  return true;
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();
  
  console.log(`🚀 [${timestamp}] [${requestId}] Public Webhook endpoint called!`)
  console.log(`📡 [${requestId}] Method:`, req.method)
  console.log(`📡 [${requestId}] URL:`, req.url)
  console.log(`📡 [${requestId}] Headers:`, Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight request handled`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables (support alt names without SUPABASE_ prefix)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
    const mercadopagoWebhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')

    console.log(`🔧 [${requestId}] Environment variables loaded`)
    console.log(`🔧 [${requestId}] Supabase URL:`, supabaseUrl)
    console.log(`🔧 [${requestId}] Webhook Secret:`, mercadopagoWebhookSecret ? 'Present' : 'Missing')

    // Create Supabase client
    console.log(`🔗 [${requestId}] Creating Supabase client...`)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log(`✅ [${requestId}] Supabase client created successfully`)

    // Get the request body
    console.log(`📨 [${requestId}] Reading request body...`)
    const body = await req.text()
    const signature = req.headers.get('x-signature') || req.headers.get('x-signature-256')

    console.log(`📨 [${requestId}] Request body received:`, body)
    console.log(`🔐 [${requestId}] Signature:`, signature ? 'Present' : 'Missing')

    // Log everything for debugging
    console.log(`📋 [${requestId}] Full request details:`)
    console.log(`  - Method: ${req.method}`)
    console.log(`  - URL: ${req.url}`)
    console.log(`  - Body length: ${body.length}`)
    console.log(`  - Body content: ${body}`)
    console.log(`  - Request ID: ${requestId}`)
    console.log(`  - Timestamp: ${timestamp}`)

    // Try to parse JSON if possible
    console.log(`🔍 [${requestId}] Attempting to parse JSON body...`)
    let webhookData: any = null
    try {
      if (body && body.trim()) {
        webhookData = JSON.parse(body)
        console.log(`📨 [${requestId}] Parsed webhook data:`, JSON.stringify(webhookData, null, 2))
        console.log(`✅ [${requestId}] JSON parsing successful`)
      } else {
        console.log(`⚠️ [${requestId}] Body is empty or contains only whitespace`)
      }
    } catch (parseError) {
      console.log(`❌ [${requestId}] Could not parse JSON body:`, parseError.message)
      console.log(`📨 [${requestId}] Raw body:`, body)
      console.log(`🔍 [${requestId}] Parse error details:`, parseError)
    }

    // Verify webhook signature (best-effort). Em teste, não bloqueia o processamento.
    console.log(`🔐 [${requestId}] Verifying webhook signature...`)
    if (mercadopagoWebhookSecret && signature) {
      try {
        const isValidSignature = await verifyMercadoPagoSignature(req, body);
        if (!isValidSignature) {
          console.log(`❌ [${requestId}] Invalid webhook signature`);
        } else {
          console.log(`✅ [${requestId}] Webhook signature verified`);
        }
      } catch (signatureError) {
        console.log(`❌ [${requestId}] Error verifying signature:`, signatureError);
      }
    } else {
      console.log(`⚠️ [${requestId}] Skipping signature verification - secret or signature missing`);
    }

    // Extract query params as fallback (Mercado Pago envia type e data.id na URL)
    console.log(`🔍 [${requestId}] Extracting query parameters...`)
    const url = new URL(req.url);
    const qpType = url.searchParams.get('type');
    const qpDataId = url.searchParams.get('data.id');
    console.log(`📋 [${requestId}] Query params - type: ${qpType}, data.id: ${qpDataId}`);

    // If we have valid webhook data, process it
    console.log(`🔄 [${requestId}] Determining processing method...`)
    if (webhookData && (webhookData.type || webhookData.topic)) {
      const type = webhookData.type || webhookData.topic;
      const data = webhookData.data || webhookData;
      
      console.log(`📊 [${requestId}] Processing webhook data - type: ${type}`);
      console.log(`📊 [${requestId}] Data payload:`, JSON.stringify(data, null, 2));

      switch (type) {
        case 'payment':
          console.log(`💳 [${requestId}] Handling payment webhook...`);
          await handlePayment(supabase, data, requestId)
          break
        case 'subscription_preapproval':
          console.log(`📅 [${requestId}] Handling subscription webhook...`);
          await handleSubscription(supabase, data, requestId)
          break
        case 'subscription_authorized_payment':
          console.log(`🔄 [${requestId}] Handling subscription payment webhook...`);
          await handleSubscriptionPayment(supabase, data, requestId)
          break
        case 'merchant_order': {
          console.log(`🧾 [${requestId}] Handling merchant order webhook...`);
          const orderId = data?.id || new URL(data.resource).pathname.split('/').pop();
          if (orderId) {
            await handleMerchantOrder(supabase, orderId, requestId);
          }
          break;
        }
        default:
          console.log(`⚠️ [${requestId}] Unhandled webhook type: ${type}`)
      }
    } else if (qpType && qpDataId) {
      console.log(`ℹ️ [${requestId}] Processing via query params fallback:`, { qpType, qpDataId });
      switch (qpType) {
        case 'payment':
          console.log(`💳 [${requestId}] Handling payment via query params...`);
          await handlePayment(supabase, { id: qpDataId }, requestId);
          break;
        case 'merchant_order':
          console.log(`🧾 [${requestId}] Handling merchant order via query params...`);
          await handleMerchantOrder(supabase, qpDataId, requestId);
          break;
        default:
          console.log(`⚠️ [${requestId}] Unhandled webhook type via query params: ${qpType}`);
      }
    } else {
      console.log(`⚠️ [${requestId}] No valid webhook data to process - neither JSON payload nor query params found`)
      console.log(`📊 [${requestId}] Webhook data check:`, {
        hasWebhookData: !!webhookData,
        webhookType: webhookData?.type || webhookData?.topic,
        hasQueryParams: !!(qpType && qpDataId),
        queryType: qpType,
        queryDataId: qpDataId
      });
    }

    console.log(`✅ [${requestId}] Webhook processing completed successfully`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Public webhook received and processed',
        requestId,
        timestamp 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error(`❌ [${requestId}] Webhook error:`, error)
    console.error(`❌ [${requestId}] Error stack:`, error.stack)
    console.error(`❌ [${requestId}] Error details:`, {
      name: error.name,
      message: error.message,
      cause: error.cause
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        timestamp,
        errorType: error.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handlePayment(supabase: any, paymentData: any, requestId: string = 'unknown') {
  console.log(`💳 [${requestId}] Processing payment data received:`, JSON.stringify(paymentData, null, 2));
  
  try {
    console.log(`🔄 [${requestId}] Starting payment processing...`);
    
    // Se recebemos apenas o ID, buscar dados completos na API
    let fullPaymentData = paymentData;
    
    // Identificar a estrutura dos dados recebidos
    console.log(`🔍 [${requestId}] Identifying payment ID from data structure...`);
    let paymentId = null;
    if (paymentData.data && paymentData.data.id) {
      paymentId = paymentData.data.id;
      console.log(`📋 [${requestId}] Payment ID found in data.id: ${paymentId}`);
    } else if (paymentData.id) {
      paymentId = paymentData.id;
      console.log(`📋 [${requestId}] Payment ID found in id: ${paymentId}`);
    }
    
    console.log(`🆔 [${requestId}] Payment ID identified: ${paymentId}`);
    
    if (paymentId) {
      console.log(`🔍 [${requestId}] Fetching complete payment data for ID: ${paymentId}`);
      try {
        fullPaymentData = await fetchPaymentDetails(paymentId);
        console.log(`📨 [${requestId}] Complete payment data from API:`, JSON.stringify(fullPaymentData, null, 2));
        console.log(`✅ [${requestId}] Payment data fetched successfully`);
      } catch (error) {
        console.error(`❌ [${requestId}] Error fetching payment details:`, error);
        console.error(`❌ [${requestId}] Error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Se não conseguir buscar, usar dados básicos
        console.log(`⚠️ [${requestId}] Using fallback payment data due to fetch error`);
        fullPaymentData = {
          id: paymentId,
          status: 'pending',
          external_reference: null,
          transaction_amount: 0,
          payer: null
        };
      }
    } else {
      console.log(`⚠️ [${requestId}] No payment ID found in data structure`);
      console.log(`📊 [${requestId}] Payment data structure analysis:`, {
        hasDataId: !!(paymentData.data && paymentData.data.id),
        hasId: !!paymentData.id,
        dataKeys: Object.keys(paymentData),
        dataDataKeys: paymentData.data ? Object.keys(paymentData.data) : null
      });
    }

    console.log(`🔍 [${requestId}] Extracting payment details from full data...`);
    const { id, status, external_reference, transaction_amount, payer } = fullPaymentData

    console.log(`🔍 [${requestId}] Payment details extracted:`);
    console.log(`  - ID: ${id}`);
    console.log(`  - Status: ${status}`);
    console.log(`  - External Reference: ${external_reference}`);
    console.log(`  - Amount: ${transaction_amount}`);
    console.log(`  - Payer: ${payer ? JSON.stringify(payer) : 'null'}`);

    // **PONTO CRÍTICO: VALIDAÇÃO DO EXTERNAL_REFERENCE**
    console.log(`🔍 [${requestId}] Validating external_reference...`);
    if (!external_reference) {
      console.log(`❌ [${requestId}] CRITICAL: No external_reference found - payment cannot be processed!`);
      console.log(`📊 [${requestId}] Full payment data for debug:`, JSON.stringify(fullPaymentData, null, 2));
      console.log(`🔍 [${requestId}] External reference analysis:`, {
        external_reference_value: external_reference,
        external_reference_type: typeof external_reference,
        is_null: external_reference === null,
        is_undefined: external_reference === undefined,
        is_empty_string: external_reference === '',
        payment_metadata: fullPaymentData.metadata
      });
      
      // Salvar payment data mesmo sem external_reference para debug
      console.log(`📝 [${requestId}] Saving payment for debugging without external_reference...`);
      try {
        const debugResult = await supabase
          .from('payment_history')
          .insert({
            payment_provider: 'mercadopago',
            payment_id: id?.toString() || 'unknown',
            amount: transaction_amount || 0,
            currency: 'BRL',
            status: 'pending',
            description: `Pagamento MercadoPago - ${status} (sem external_reference) - ${requestId}`,
            payment_method: 'pix',
            metadata: {
              mercadopago_payment_id: id,
              status,
              error: 'No external_reference found',
              full_payment_data: fullPaymentData,
              debug_request_id: requestId,
              debug_timestamp: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          });
        
        if (debugResult.error) {
          console.error(`❌ [${requestId}] Error saving debug payment:`, debugResult.error);
        } else {
          console.log(`✅ [${requestId}] Payment saved for debugging without external_reference`);
        }
      } catch (debugError) {
        console.error(`❌ [${requestId}] Exception saving debug payment:`, debugError);
      }
      
      console.log(`✅ [${requestId}] Payment processing completed (waiting for external_reference)`);
      return;
    }

    // **PONTO CRÍTICO: VERIFICAÇÃO DE USUÁRIO**
    console.log(`🔍 [${requestId}] Verificando se o usuário existe: ${external_reference}`);
    console.log(`🔍 [${requestId}] External reference type: ${typeof external_reference}`);
    
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', external_reference)
      .single();

    console.log(`📊 [${requestId}] User verification result:`, {
      userExists: !!userExists,
      userError: userError,
      userData: userExists
    });

    if (userError || !userExists) {
      console.log(`❌ [${requestId}] CRITICAL: User not found for external_reference: ${external_reference}`);
      console.log(`❌ [${requestId}] User error details:`, userError);
      console.log(`🔍 [${requestId}] User lookup attempted with:`, {
        external_reference,
        external_reference_type: typeof external_reference,
        query_table: 'profiles',
        query_column: 'id'
      });
      
      // Ainda assim, salvar o pagamento para debug
      console.log(`📝 [${requestId}] Saving payment for debugging (user not found)...`);
      try {
        const userNotFoundResult = await supabase
          .from('payment_history')
          .insert({
            payment_provider: 'mercadopago',
            payment_id: id?.toString() || 'unknown',
            amount: transaction_amount || 0,
            currency: 'BRL',
            status: 'failed',
            description: `Pagamento MercadoPago - ${status} (usuário não encontrado) - ${requestId}`,
            payment_method: 'pix',
            metadata: {
              mercadopago_payment_id: id,
              external_reference,
              error: 'User not found in profiles table',
              user_error: userError,
              payer_email: payer?.email,
              payer_data: payer,
              full_payment_data: fullPaymentData,
              debug_request_id: requestId,
              debug_timestamp: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          });
          
        if (userNotFoundResult.error) {
          console.error(`❌ [${requestId}] Error saving debug payment for missing user:`, userNotFoundResult.error);
        } else {
          console.log(`✅ [${requestId}] Payment saved for debugging (user not found)`);
        }
      } catch (debugError) {
        console.error(`❌ [${requestId}] Exception saving debug payment for missing user:`, debugError);
      }
      
      console.log(`❌ [${requestId}] Cannot process payment: user not found`);
      return;
    }

    console.log(`✅ [${requestId}] User found, proceeding with payment processing`);
    console.log(`👤 [${requestId}] User data:`, userExists);

    // **PONTO CRÍTICO: ATUALIZAÇÃO DO HISTÓRICO DE PAGAMENTO**
    console.log(`📝 [${requestId}] Updating payment history...`);
    console.log(`📝 [${requestId}] Payment data to save:`, {
      user_id: external_reference,
      payment_provider: 'mercadopago',
      payment_id: id?.toString(),
      amount: transaction_amount || 0,
      status: status === 'approved' ? 'succeeded' : status === 'pending' ? 'pending' : 'failed',
      original_status: status
    });
    
    const { error: paymentError } = await supabase
      .from('payment_history')
      .upsert({
        user_id: external_reference, // Use external_reference as user_id
        payment_provider: 'mercadopago',
        payment_id: id?.toString() || 'unknown',
        amount: transaction_amount || 0,
        currency: 'BRL',
        status: status === 'approved' ? 'succeeded' : status === 'pending' ? 'pending' : 'failed',
        description: `Pagamento MercadoPago - ${status} - ${requestId}`,
        payment_method: 'pix',
        metadata: {
          mercadopago_payment_id: id,
          external_reference,
          payer_email: payer?.email,
          payer_data: payer,
          full_payment_data: fullPaymentData,
          debug_request_id: requestId,
          debug_timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error(`❌ [${requestId}] Error updating payment history:`, paymentError)
      console.error(`❌ [${requestId}] Payment error details:`, {
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint
      });
      throw paymentError
    }

    console.log(`✅ [${requestId}] Payment history updated successfully`);

    // **PONTO MAIS CRÍTICO: ATIVAÇÃO DE ASSINATURA**
    console.log(`🔍 [${requestId}] Checking if payment should activate subscription...`);
    console.log(`🔍 [${requestId}] Status check: ${status} (approved: ${status === 'approved'}, credited: ${status === 'credited'})`);
    
    if (status === 'approved' || status === 'credited') {
      console.log(`🔄 [${requestId}] Payment approved, updating subscription...`);
      console.log(`📊 [${requestId}] Subscription update payload:`, {
        external_reference,
        transaction_amount,
        user_id: external_reference,
        status
      });
      
      try {
        await updateSubscriptionFromPayment(supabase, fullPaymentData, requestId);
        console.log(`✅ [${requestId}] Subscription updated successfully`);
      } catch (subscriptionError) {
        console.error(`❌ [${requestId}] CRITICAL ERROR updating subscription:`, subscriptionError);
        console.error(`❌ [${requestId}] Subscription error details:`, {
          name: subscriptionError.name,
          message: subscriptionError.message,
          stack: subscriptionError.stack,
          cause: subscriptionError.cause
        });
        
        // Salvar erro para debug
        console.log(`📝 [${requestId}] Saving subscription error for debugging...`);
        try {
          const subscriptionErrorResult = await supabase
            .from('payment_history')
            .upsert({
              user_id: external_reference,
              payment_provider: 'mercadopago',
              payment_id: id?.toString() || 'unknown',
              amount: transaction_amount || 0,
              currency: 'BRL',
              status: 'failed',
              description: `Erro ao atualizar assinatura - ${subscriptionError.message} - ${requestId}`,
              payment_method: 'pix',
              metadata: {
                mercadopago_payment_id: id,
                external_reference,
                subscription_error: subscriptionError.message,
                subscription_error_stack: subscriptionError.stack,
                payer_email: payer?.email,
                full_payment_data: fullPaymentData,
                debug_request_id: requestId,
                debug_timestamp: new Date().toISOString()
              },
              created_at: new Date().toISOString()
            });
            
          if (subscriptionErrorResult.error) {
            console.error(`❌ [${requestId}] Error saving subscription error:`, subscriptionErrorResult.error);
          } else {
            console.log(`✅ [${requestId}] Subscription error saved for debugging`);
          }
        } catch (debugError) {
          console.error(`❌ [${requestId}] Exception saving subscription error:`, debugError);
        }
      }
    } else {
      console.log(`⚠️ [${requestId}] Payment not approved yet, status: ${status}`);
      console.log(`📊 [${requestId}] Payment details for non-approved status:`, {
        id,
        status,
        external_reference,
        transaction_amount,
        status_approved: status === 'approved',
        status_credited: status === 'credited'
      });
    }

    console.log(`✅ [${requestId}] Payment processed successfully`)
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing payment:`, error)
    console.error(`❌ [${requestId}] Error stack:`, error.stack)
    throw error
  }
}

async function fetchMerchantOrderDetails(orderId: string): Promise<any> {
  console.log('🔍 Fetching merchant order details for ID:', orderId);
  
  const accessToken = Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN');
  if (!accessToken) throw new Error('Missing MercadoPago access token');
  
  // Usar a URL correta da API do MercadoPago para merchant orders
  const url = `https://api.mercadopago.com/v1/merchant_orders/${orderId}`;
  console.log('📡 Fetching from URL:', url);
  
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    console.error('❌ Merchant order fetch failed:', { status: resp.status, text });
    throw new Error(`Merchant order fetch error: ${resp.status} - ${text}`);
  }
  
  const result = await resp.json();
  console.log('✅ Merchant order fetched successfully');
  return result;
}

async function handleMerchantOrder(supabase: any, orderId: string, requestId: string = 'unknown') {
  console.log('🧾 Processing merchant_order:', orderId);
  
  try {
    const order = await fetchMerchantOrderDetails(orderId);
    console.log('📋 Merchant order details:', JSON.stringify(order, null, 2));
    
    const payments = Array.isArray(order?.payments) ? order.payments : [];
    console.log('💳 Found payments in order:', payments.length);
    
    for (const p of payments) {
      if (p?.id) {
        console.log('🔄 Processing payment from merchant order:', p.id);
        // Corrigir chamada para handlePayment - passar objeto correto
        await handlePayment(supabase, { id: String(p.id) }, requestId);
      }
    }
    
    console.log('✅ Merchant order processing completed');
  } catch (error) {
    console.error('❌ Error processing merchant order:', error);
    throw error;
  }
}

async function handleSubscription(supabase: any, subscriptionData: any, requestId: string = 'unknown') {
  console.log('📅 Processing subscription:', subscriptionData.id)
  
  const { id, status, external_reference, reason, auto_recurring } = subscriptionData

  // Buscar o plan_id correto baseado no valor da assinatura
  console.log('🔍 Looking for subscription plan based on auto_recurring:', auto_recurring);
  
  let planId;
  
  // Se há auto_recurring com valor, buscar plano pago
  if (auto_recurring && auto_recurring.transaction_amount > 0) {
    const { data: paidPlans, error: paidPlanError } = await supabase
      .from('subscription_plans')
      .select('id, name, price')
      .eq('active', true)
      .gt('price', 0) // Apenas planos pagos
      .order('price', { ascending: true })
      .limit(1);

    if (paidPlanError) {
      console.error('❌ Error fetching paid subscription plans:', paidPlanError);
      throw paidPlanError;
    }

    if (paidPlans && paidPlans.length > 0) {
      planId = paidPlans[0].id;
      console.log('✅ Found paid plan:', { id: planId, name: paidPlans[0].name, price: paidPlans[0].price });
    } else {
      console.error('❌ No paid subscription plans found');
      throw new Error('No paid subscription plans available');
    }
  } else {
    // Se não há valor, buscar plano gratuito
    const { data: freePlans, error: freePlanError } = await supabase
      .from('subscription_plans')
      .select('id, name, price')
      .eq('active', true)
      .eq('price', 0) // Apenas plano gratuito
      .limit(1);

    if (freePlanError) {
      console.error('❌ Error fetching free subscription plans:', freePlanError);
      throw freePlanError;
    }

    if (freePlans && freePlans.length > 0) {
      planId = freePlans[0].id;
      console.log('✅ Found free plan:', { id: planId, name: freePlans[0].name, price: freePlans[0].price });
    } else {
      console.error('❌ No free subscription plans found');
      throw new Error('No free subscription plans available');
    }
  }

  // Update user subscription
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference, // Assuming external_reference is user_id
      plan_id: planId, // Usar o UUID correto
      mercadopago_subscription_id: id.toString(),
      status: status,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (subError) {
    console.error('❌ Error updating subscription:', subError)
    throw subError
  }

  console.log('✅ Subscription processed successfully')
}

async function handleSubscriptionPayment(supabase: any, paymentData: any, requestId: string = 'unknown') {
  console.log('🔄 Processing subscription payment:', paymentData.id)
  
  // Handle recurring payment for subscription
  await handlePayment(supabase, paymentData, requestId)
}



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
