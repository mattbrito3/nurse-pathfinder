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
    const webhookSecret = Deno.env.get('ABACATE_PAY_WEBHOOK_SECRET')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verificar assinatura do webhook (se configurada)
    const signature = req.headers.get('x-abacate-signature')
    if (webhookSecret && signature) {
      // TODO: Implementar verificação de assinatura se necessário
      console.log('🔍 Webhook signature:', signature)
    }

    const webhookData = await req.json()
    console.log('🔍 AbacatePay webhook received:', webhookData)

    // Verificar se é um evento de pagamento PIX
    if (webhookData.type === 'pix.paid' || webhookData.data?.status === 'PAID') {
      const paymentId = webhookData.data?.id || webhookData.paymentId
      
      if (!paymentId) {
        throw new Error('No payment ID in webhook data')
      }

      console.log('💰 Processing PIX payment:', paymentId)

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

      // Verificar se já foi processado
      if (paymentData.status === 'succeeded') {
        console.log('✅ Payment already processed:', paymentId)
        return new Response('OK', { status: 200 })
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

      // Cancelar qualquer assinatura ativa existente
      const { error: cancelError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled', 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', paymentData.user_id)
        .eq('status', 'active')

      if (cancelError) {
        console.log('ℹ️ No existing subscription to cancel or error:', cancelError)
      }

      // Criar nova assinatura ativa
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: paymentData.user_id,
          plan_id: paymentData.metadata?.planType === 'annual' ? 2 : 1, // 1 = professional, 2 = annual
          stripe_customer_id: null,
          stripe_subscription_id: null,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (paymentData.metadata?.planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })

      if (subscriptionError) {
        console.error('❌ Error creating subscription:', subscriptionError)
        throw new Error('Failed to create subscription')
      }

      console.log('✅ Payment processed and subscription activated via webhook')
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('❌ AbacatePay webhook error:', error)
    
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