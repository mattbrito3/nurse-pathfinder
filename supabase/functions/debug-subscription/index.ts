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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { userId } = await req.json()

    console.log('🔍 Debug subscription for user:', userId)

    if (!userId) {
      throw new Error('User ID is required')
    }

    // 1. Verificar payment_history
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // 2. Verificar user_subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price,
          interval
        )
      `)
      .eq('user_id', userId)

    // 3. Verificar subscription_plans disponíveis
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)

    const result = {
      success: true,
      userId,
      payments: {
        data: payments || [],
        error: paymentsError?.message
      },
      subscriptions: {
        data: subscriptions || [],
        error: subsError?.message
      },
      plans: {
        data: plans || [],
        error: plansError?.message
      }
    }

    console.log('📊 Debug result:', JSON.stringify(result, null, 2))

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Debug subscription error:', error)
    
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