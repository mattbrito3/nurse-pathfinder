import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
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
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body and signature
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      throw new Error('No Stripe signature found')
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
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

        // Update or create user subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planData.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
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
            status: 'completed',
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
        
        // Update subscription status in database
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Error updating subscription:', error)
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