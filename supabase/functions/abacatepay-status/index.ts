// @ts-ignore
declare const Deno;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const abacatePayApiKey = Deno.env.get('ABACATE_PAY_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { paymentId } = await req.json()

    console.log('🔍 Checking AbacatePay status for:', paymentId)

    if (!paymentId) {
      throw new Error('Payment ID is required')
    }

    // Verificar status via AbacatePay API
    const statusResponse = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json()
      console.error('❌ AbacatePay status check error:', errorData)
      throw new Error(`AbacatePay API error: ${errorData.error || statusResponse.statusText}`)
    }

    const statusData = await statusResponse.json()
    console.log('✅ AbacatePay status:', statusData)

    if (!statusData.data) {
      throw new Error('No status data received from AbacatePay')
    }

    const status = statusData.data.status
    const expiresAt = statusData.data.expiresAt

    // Se o pagamento foi aprovado, atualizar no banco
    if (status === 'PAID') {
      // Buscar o pagamento no banco
      const { data: paymentData, error: fetchError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_id', paymentId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching payment:', fetchError)
        throw new Error('Payment not found in database')
      }

      // Atualizar status do pagamento
      const { error: updateError } = await supabase
        .from('payment_history')
        .update({
          status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)

      if (updateError) {
        console.error('❌ Error updating payment status:', updateError)
        throw new Error('Failed to update payment status')
      }

      // Primeiro, verificar se já existe uma subscription ativa para este usuário
      const { data: existingSubscription, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', paymentData.user_id)
        .eq('status', 'active')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing subscription:', checkError)
      }

      if (existingSubscription) {
        console.log('✅ User already has active subscription:', existingSubscription.id)
      } else {
        // Buscar o plano correto
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true })

        if (plansError) {
          console.error('❌ Error fetching plans:', plansError)
          throw new Error('Failed to fetch subscription plans')
        }

        // Determinar o plano baseado no planType
        let selectedPlan = plans[0] // Default para o primeiro plano
        if (paymentData.metadata?.planType === 'annual') {
          selectedPlan = plans.find(p => p.interval === 'year') || plans[1] || plans[0]
        } else {
          selectedPlan = plans.find(p => p.interval === 'month') || plans[0]
        }

        console.log('🎯 Creating subscription with plan:', selectedPlan.name, '(ID:', selectedPlan.id, ')')

        // Ativar assinatura do usuário
        const { data: newSubscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: paymentData.user_id,
            plan_id: selectedPlan.id,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (selectedPlan.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (subscriptionError) {
          console.error('❌ Error creating subscription:', subscriptionError)
          throw new Error('Failed to create subscription')
        }

        console.log('✅ Successfully created subscription:', newSubscription.id)
      }

      console.log('✅ Payment processed and subscription activated')
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        expiresAt: expiresAt,
        isPaid: status === 'PAID'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ AbacatePay status check error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 