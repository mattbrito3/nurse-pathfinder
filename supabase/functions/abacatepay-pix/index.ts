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

    const { planType, userId, amount, description } = await req.json()

    console.log('🔍 AbacatePay PIX Request:', { planType, userId, amount, description })

    // TODO: Integrar com API real do AbacatePay
    // Por enquanto, simulando a resposta
    
    const mockPixResponse = {
      success: true,
      pixData: {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        qrCodeText: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Nurse Pathfinder6009Sao Paulo62070503***6304E2CA',
        paymentId: `pix_${Date.now()}_${userId}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        amount: amount,
        description: description
      }
    }

    // Salvar dados do pagamento no banco
    const { error: dbError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'brl',
        status: 'pending',
        payment_method: 'pix',
        payment_provider: 'abacatepay',
        payment_id: mockPixResponse.pixData.paymentId,
        metadata: {
          planType,
          pixData: mockPixResponse.pixData
        }
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error('Failed to save payment data')
    }

    console.log('✅ PIX generated successfully:', mockPixResponse.pixData.paymentId)

    return new Response(
      JSON.stringify(mockPixResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ AbacatePay PIX error:', error)
    
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