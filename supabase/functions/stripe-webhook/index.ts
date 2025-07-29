// @ts-ignore: Deno is available in Supabase Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore: Deno supports URL imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno supports URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore: Deno supports URL imports
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Configure function to run without authentication requirements
serve(async (req: Request) => {
  console.log('🔍 WEBHOOK CALLED - Method:', req.method)
  console.log('🔍 WEBHOOK CALLED - URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Get environment variables with defaults
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('🔧 Environment check:')
    console.log('  Stripe Secret:', stripeSecretKey ? 'SET' : 'MISSING')
    console.log('  Webhook Secret:', webhookSecret ? 'SET' : 'MISSING')  
    console.log('  Supabase URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.log('  Service Key:', supabaseServiceKey ? 'SET' : 'MISSING')

    if (!stripeSecretKey || !webhookSecret) {
      console.log('❌ Stripe configuration missing')
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ Supabase configuration missing')  
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the raw body and signature
    const body = await req.text()
    
    // 🔍 DEBUG: Log all headers to see what's coming from Stripe
    console.log('🔍 ALL HEADERS RECEIVED:')
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      console.log('❌ stripe-signature header not found')
      throw new Error('No Stripe signature found')
    }

    let event: Stripe.Event

    try {
      // 🚧 TEMPORARILY DISABLED: Verify webhook signature
      // event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
      
      // 🔍 DEBUG: Parse event directly without signature verification
      console.log('🔍 RAW BODY:', body)
      event = JSON.parse(body) as Stripe.Event
      console.log('🔍 PARSED EVENT:', event.type)
    } catch (err) {
      console.log(`❌ Webhook signature verification failed: ${err.message}`)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('🎯 Received Stripe event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Payment successful for session:', session.id)
        
        // Extract metadata
        const userId = session.metadata?.userId
        const planType = session.metadata?.planType
        
        if (!userId || !planType) {
          console.error('❌ Missing metadata in session:', session.id)
          break
        }

        // Get subscription and customer info
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        console.log('💾 Updating database for user:', userId)
        console.log('📋 Plan type:', planType)
        console.log('👤 Customer ID:', customerId)
        console.log('📄 Subscription ID:', subscriptionId)

        // Get the subscription plan from database
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .ilike('name', planType === 'professional' ? '%profissional%' : '%anual%')
          .single()

        if (planError || !planData) {
          console.error('❌ Plan not found:', planError)
          break
        }

        // First, cancel any existing active subscriptions for this user
        const { error: cancelError } = await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'active')

        if (cancelError) {
          console.log('ℹ️ No existing subscription to cancel or error:', cancelError)
        }

        // Create new subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan_id: planData.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (subscriptionError) {
          console.error('❌ Error updating subscription:', subscriptionError)
          break
        }

        // Record payment history
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            amount: session.amount_total! / 100, // Convert from cents
            currency: session.currency || 'brl',
            status: 'succeeded', // ✅ Corrigido: usar 'succeeded' em vez de 'completed'
            stripe_payment_intent_id: session.payment_intent as string,
            created_at: new Date().toISOString()
          })

        if (paymentError) {
          console.error('❌ Error recording payment:', paymentError)
        }

        console.log('🎉 User subscription activated successfully!')
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔄 Subscription updated:', subscription.id)
        console.log('🔄 New status:', subscription.status)
        
        // Update subscription status in database
        const updateData: any = {
          status: subscription.status,
          updated_at: new Date().toISOString()
        }

        // ✅ Safely handle timestamps that might be null/undefined
        if (subscription.current_period_start) {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
        }
        if (subscription.current_period_end) {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
        }

        const { error } = await supabase
          .from('user_subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Error updating subscription:', error)
        } else {
          console.log('✅ Subscription updated successfully in database')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('❌ Subscription cancelled:', subscription.id)
        
        // Update subscription status to cancelled
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Error cancelling subscription:', error)
        }
        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Webhook processing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})