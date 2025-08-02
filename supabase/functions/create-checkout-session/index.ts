// Deno Edge Function - Create Checkout Session
// Este arquivo é executado no ambiente Deno, não Node.js

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
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

    // Get request body
    const { planType, userId, successUrl, cancelUrl } = await req.json()

    console.log('🚀 Creating checkout session:', { planType, userId })

    if (!planType || !userId) {
      throw new Error('Missing required parameters: planType, userId')
    }

    // Map planType to actual Stripe Price IDs - CONFIGURADO COM SEUS PRICE IDs REAIS!
    const priceMapping = {
      'professional': 'price_1RpwgqB2FIOsvy1CyGL5KoiS', // R$ 29,00/mês (Estudante) ✅
      'annual': 'price_1RpwhNB2FIOsvy1C8XVwDTt6',       // R$ 59,00/mês (Profissional) ✅
    }

    const priceId = priceMapping[planType as keyof typeof priceMapping]
    if (!priceId) {
      throw new Error(`Invalid plan type: ${planType}`)
    }

    console.log('💳 Using Price ID:', priceId, 'for plan:', planType)

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData.user) {
      throw new Error('User not found')
    }

    console.log('💳 Creating Stripe checkout for user:', userData.user.email)
    console.log('🔑 Stripe key configured:', stripeSecretKey ? 'YES' : 'NO')
    console.log('🔑 Stripe key length:', stripeSecretKey?.length || 0)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userData.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/pricing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing?payment=canceled`,
      metadata: {
        userId: userId,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: planType,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    console.log('✅ Checkout session created:', session.id)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Checkout session error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to create checkout session'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})