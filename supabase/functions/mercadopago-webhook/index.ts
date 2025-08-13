import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Webhook endpoint called!')
  console.log('📡 Method:', req.method)
  console.log('📡 URL:', req.url)
  console.log('📡 Headers:', Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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
    let webhookData = null
    try {
      if (body && body.trim()) {
        webhookData = JSON.parse(body)
        console.log('📨 Parsed webhook data:', JSON.stringify(webhookData, null, 2))
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON body:', parseError.message)
      console.log('📨 Raw body:', body)
    }

    // If we have valid webhook data, process it
    if (webhookData && webhookData.type) {
      const { type, data } = webhookData

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
        default:
          console.log('⚠️ Unhandled webhook type:', type)
      }
    } else {
      console.log('ℹ️ No valid webhook data to process')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received and logged' }),
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
  
  const { id, status, external_reference, transaction_amount, payer } = paymentData

  // Update payment history
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
      metadata: {
        mercadopago_payment_id: id,
        external_reference,
        payer_email: payer?.email,
        payer_data: payer,
        full_payment_data: paymentData
      },
      created_at: new Date().toISOString()
    })

  if (paymentError) {
    console.error('❌ Error updating payment history:', paymentError)
    throw paymentError
  }

  // If payment is approved, update subscription
  if (status === 'approved') {
    await updateSubscriptionFromPayment(supabase, paymentData)
  }

  console.log('✅ Payment processed successfully')
}

async function handleSubscription(supabase: any, subscriptionData: any) {
  console.log('📅 Processing subscription:', subscriptionData.id)
  
  const { id, status, external_reference, reason, auto_recurring } = subscriptionData

  // Update user subscription
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference, // Assuming external_reference is user_id
      subscription_plan_id: 1, // Default to student plan
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
  const { external_reference, transaction_amount } = paymentData

  // Determine plan based on amount
  let planId = 1 // Default to student plan (R$ 18,99)
  if (transaction_amount >= 18.99) {
    planId = 1 // Student plan
  }

  // Update user subscription
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: external_reference,
      subscription_plan_id: planId,
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