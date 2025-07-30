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

    const { planType, userId, amount, description, customerData } = await req.json()

    console.log('🔍 AbacatePay PIX Request:', { planType, userId, amount, description, customerData })

    // Validar dados obrigatórios
    if (!amount || !customerData) {
      throw new Error('Amount and customer data are required')
    }

    // Preparar dados do cliente para AbacatePay
    const customer = {
      name: customerData.name || 'Cliente Nurse Pathfinder',
      cellphone: customerData.phone || '(11) 99999-9999',
      email: customerData.email,
      taxId: customerData.taxId || '123.456.789-01' // TODO: Implementar validação de CPF
    }

    // Criar QR Code PIX via AbacatePay API
    const pixResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Converter para centavos (obrigatório)
        expiresIn: 1800, // 30 minutos (opcional)
        description: description || `Plano ${planType} - Nurse Pathfinder`, // opcional, max 140 chars
        customer: customer // obrigatório se fornecido
      })
    })

    if (!pixResponse.ok) {
      const errorData = await pixResponse.json()
      console.error('❌ AbacatePay API error:', errorData)
      throw new Error(`AbacatePay API error: ${errorData.error || pixResponse.statusText}`)
    }

    const pixData = await pixResponse.json()
    console.log('✅ AbacatePay PIX created:', pixData)

    if (!pixData.data) {
      throw new Error('No PIX data received from AbacatePay')
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
        payment_id: pixData.data.id,
        metadata: {
          planType,
          pixData: pixData.data,
          customer: customer
        }
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error('Failed to save payment data')
    }

    console.log('✅ PIX payment saved to database:', pixData.data.id)

    // Retornar dados formatados para o frontend
    const responseData = {
      success: true,
      pixData: {
        qrCode: pixData.data.brCodeBase64,
        qrCodeText: pixData.data.brCode,
        paymentId: pixData.data.id,
        expiresAt: pixData.data.expiresAt,
        amount: amount,
        description: description,
        status: pixData.data.status
      }
    }

    return new Response(
      JSON.stringify(responseData),
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