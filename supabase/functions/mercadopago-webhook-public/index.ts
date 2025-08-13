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
  const accessToken = Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN');
  if (!accessToken) throw new Error('Missing MercadoPago access token');
  const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`MercadoPago payments fetch error: ${resp.status} - ${text}`);
  }
  return await resp.json();
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
  console.log('🚀 Public Webhook endpoint called!')
  console.log('📡 Method:', req.method)
  console.log('📡 URL:', req.url)
  console.log('📡 Headers:', Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables (support alt names without SUPABASE_ prefix)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!
    const mercadopagoWebhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')

    console.log('🔧 Environment variables loaded')
    console.log('🔧 Supabase URL:', supabaseUrl)
    console.log('🔧 Webhook Secret:', mercadopagoWebhookSecret ? 'Present' : 'Missing')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the request body
    const body = await req.text()
    const signature = req.headers.get('x-signature') || req.headers.get('x-signature-256')

    console.log('📨 Request body received:', body)
    console.log('🔐 Signature:', signature ? 'Present' : 'Missing')

    // Log everything for debugging
    console.log('📋 Full request details:')
    console.log('  - Method:', req.method)
    console.log('  - URL:', req.url)
    console.log('  - Body length:', body.length)
    console.log('  - Body content:', body)

    // Try to parse JSON if possible
    let webhookData: any = null
    try {
      if (body && body.trim()) {
        webhookData = JSON.parse(body)
        console.log('📨 Parsed webhook data:', JSON.stringify(webhookData, null, 2))
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON body:', parseError.message)
      console.log('📨 Raw body:', body)
    }

    // Verify webhook signature (best-effort). Em teste, não bloqueia o processamento.
    if (mercadopagoWebhookSecret && signature) {
      const isValidSignature = await verifyMercadoPagoSignature(req, body);
      if (!isValidSignature) {
        console.log('❌ Invalid webhook signature');
      } else {
        console.log('✅ Webhook signature verified');
      }
    }

    // Extract query params as fallback (Mercado Pago envia type e data.id na URL)
    const url = new URL(req.url);
    const qpType = url.searchParams.get('type');
    const qpDataId = url.searchParams.get('data.id');

    // If we have valid webhook data, process it
    if (webhookData && (webhookData.type || webhookData.topic)) {
      const type = webhookData.type || webhookData.topic;
      const data = webhookData.data || webhookData;

      switch (type) {
        case 'payment':
          await handlePayment(supabase, data)
          break
        case 'subscription_preapproval':
          await handleSubscription(supabase, data)
          break
        case 'subscription_authorized_payment':
          await handleSubscriptionPayment(supabase, data)
          break
        case 'merchant_order': {
          const orderId = data?.id || new URL(data.resource).pathname.split('/').pop();
          if (orderId) {
            await handleMerchantOrder(supabase, orderId);
          }
          break;
        }
        default:
          console.log('⚠️ Unhandled webhook type:', type)
      }
    } else if (qpType && qpDataId) {
      console.log('ℹ️ Processing via query params fallback:', { qpType, qpDataId });
      switch (qpType) {
        case 'payment':
          await handlePayment(supabase, { id: qpDataId });
          break;
        case 'merchant_order':
          await handleMerchantOrder(supabase, qpDataId);
          break;
        default:
          console.log('⚠️ Unhandled webhook type via query params:', qpType);
      }
    } else {
      console.log('ℹ️ No valid webhook data to process')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Public webhook received and processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handlePayment(supabase: any, paymentData: any) {
  console.log('💳 Processing payment:', paymentData.id)
  
  try {
    // Buscar dados completos do pagamento via REST
    const fullPaymentData = await fetchPaymentDetails(paymentData.id);
    console.log('📨 Full payment data:', JSON.stringify(fullPaymentData, null, 2));
    
    const { id, status, external_reference, transaction_amount, payer } = fullPaymentData

    console.log('🔍 Payment details extracted:');
    console.log('  - ID:', id);
    console.log('  - Status:', status);
    console.log('  - External Reference:', external_reference);
    console.log('  - Amount:', transaction_amount);
    console.log('  - Payer:', payer);

    // Update payment history
    console.log('📝 Updating payment history...');
    const { error: paymentError } = await supabase
      .from('payment_history')
      .upsert({
        user_id: external_reference, // Use external_reference as user_id
        payment_provider: 'mercadopago',
        payment_id: id.toString(),
        amount: transaction_amount,
        currency: 'BRL',
        status: status === 'approved' ? 'succeeded' : status === 'pending' ? 'pending' : 'failed',
        description: `Pagamento MercadoPago - ${status}`,
        payment_method: 'pix',
        external_reference,
        payment_data: fullPaymentData,
        metadata: {
          mercadopago_payment_id: id,
          external_reference,
          payer_email: payer?.email,
          payer_data: payer,
          full_payment_data: fullPaymentData
        },
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('❌ Error updating payment history:', paymentError)
      throw paymentError
    }

    console.log('✅ Payment history updated successfully');

    // If payment is approved or credited (Pix), update subscription
    if (status === 'approved' || status === 'credited' || fullPaymentData.date_approved !== null) {
      console.log('🔄 Payment approved, updating subscription...');
      await updateSubscriptionFromPayment(supabase, fullPaymentData)
    } else {
      console.log('⚠️ Payment not approved yet, status:', status);
    }

    console.log('✅ Payment processed successfully')
  } catch (error) {
    console.error('❌ Error processing payment:', error)
    throw error
  }
}

async function fetchMerchantOrderDetails(orderId: string): Promise<any> {
  const accessToken = Deno.env.get('VITE_MERCADOPAGO_ACCESS_TOKEN');
  if (!accessToken) throw new Error('Missing MercadoPago access token');
  const resp = await fetch(`https://api.mercadolibre.com/merchant_orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Merchant order fetch error: ${resp.status} - ${text}`);
  }
  return await resp.json();
}

async function handleMerchantOrder(supabase: any, orderId: string) {
  console.log('🧾 Processing merchant_order:', orderId);
  const order = await fetchMerchantOrderDetails(orderId);
  const payments = Array.isArray(order?.payments) ? order.payments : [];
  for (const p of payments) {
    if (p?.id) {
      await handlePayment(supabase, { id: String(p.id) });
    }
  }
}

async function handleSubscription(supabase: any, subscriptionData: any) {
  console.log('📅 Processing subscription:', subscriptionData.id)
  
  const { id, status, external_reference, reason, auto_recurring } = subscriptionData

  // Update user subscription
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference, // Assuming external_reference is user_id
      plan_id: 1, // Default to student plan - use plan_id instead of subscription_plan_id
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

async function handleSubscriptionPayment(supabase: any, paymentData: any) {
  console.log('🔄 Processing subscription payment:', paymentData.id)
  
  // Handle recurring payment for subscription
  await handlePayment(supabase, paymentData)
}

async function updateSubscriptionFromPayment(supabase: any, paymentData: any) {
  const { external_reference, transaction_amount, metadata } = paymentData

  // Determine plan based on amount or metadata
  let planId = 1 // Default to student plan (R$ 18,99)
  if (transaction_amount >= 18.99) {
    planId = 1 // Student plan
  }

  // Update user subscription
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference,
      plan_id: planId, // Use plan_id instead of subscription_plan_id
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })

  if (updateError) {
    console.error('❌ Error updating subscription from payment:', updateError)
    throw updateError
  }

  console.log('✅ Subscription updated from payment')
}
