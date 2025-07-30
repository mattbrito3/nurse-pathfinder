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

    const requestBody = await req.json()
    const { planType, userId, amount, description, customerData } = requestBody

    console.log('🔍 AbacatePay PIX Request:', { planType, userId, amount, description, customerData })
    console.log('🔍 Full request body:', requestBody)

    // Validar dados obrigatórios
    if (!amount) {
      throw new Error('Amount is required')
    }
    
    if (!customerData) {
      throw new Error('Customer data is required')
    }

    if (!customerData.name || !customerData.email || !customerData.cellphone || !customerData.taxId) {
      throw new Error('All customer fields (name, email, cellphone, taxId) are required')
    }

    // Preparar dados do cliente para AbacatePay
    // Para desenvolvimento, usar CPF de teste válido
    const customer = {
      name: customerData.name || 'Cliente Nurse Pathfinder',
      cellphone: customerData.cellphone || '(11) 99999-9999',
      email: customerData.email || 'cliente@nursepathfinder.com',
      taxId: customerData.taxId || '111.444.777-35' // CPF de teste válido
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

    // Salvar dados do pagamento no banco (só se userId não for de teste)
    if (userId && userId !== '12345678-1234-1234-1234-123456789abc') {
      console.log('💾 Tentando salvar no banco:', {
        user_id: userId,
        amount: amount,
        currency: 'brl',
        status: 'pending',
        payment_method: 'pix',
        description: `PIX ${planType} - ${pixData.data.id}`,
        stripe_payment_intent_id: pixData.data.id
      })

      const { data: insertData, error: dbError } = await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          amount: amount,
          currency: 'brl',
          status: 'pending',
          payment_method: 'pix',
          payment_provider: 'abacatepay',
          payment_id: pixData.data.id,
          description: `PIX ${planType} - ${pixData.data.id}`,
          metadata: {
            planType: planType,
            customerData: customer,
            abacatePayResponse: pixData.data
          }
        })
        .select()

      if (dbError) {
        console.error('❌ Database error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        })
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('✅ Dados salvos no banco:', insertData)
    } else {
      console.log('🧪 Pulando salvamento no banco (usuário de teste)')
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