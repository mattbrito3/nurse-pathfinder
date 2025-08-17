import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      planName, 
      amount, 
      paymentMethod, 
      token, 
      payerInfo,
      installments = 1,
      issuer_id 
    } = await req.json();

    // Validação básica
    if (!userId || !planName || !amount || !paymentMethod) {
      return new Response(JSON.stringify({ 
        error: "Campos obrigatórios: userId, planName, amount, paymentMethod" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Para cartão, token é obrigatório
    if (paymentMethod === 'credit_card' && !token) {
      return new Response(JSON.stringify({ 
        error: "Token do cartão é obrigatório para pagamento com cartão" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("VITE_MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Missing MercadoPago access token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const functionsUrl = Deno.env.get("PROJECT_URL") || `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
    
    // Definir valor final (respeitando mínimos e força via env)
    const requestedAmount = Number(Deno.env.get('MP_FORCE_AMOUNT') || amount);
    const minAmount = Number(Deno.env.get('MP_MIN_AMOUNT') || '1.00');
    const finalAmount = Number.isFinite(requestedAmount)
      ? Math.max(Number(requestedAmount.toFixed(2)), Math.max(0.01, minAmount))
      : Math.max(Number(amount.toFixed(2)), Math.max(0.01, minAmount));

    // Estrutura base do pagamento
    const paymentData: any = {
      transaction_amount: finalAmount,
      description: `Plano ${planName} - DoseCerta`,
      external_reference: userId,
      notification_url: `${functionsUrl}/mercadopago-webhook-public`,
      metadata: {
        userId,
        planName,
        payment_type: paymentMethod
      }
    };

    // Configuração específica por método de pagamento
    switch (paymentMethod) {
      case 'credit_card':
        paymentData.token = token;
        paymentData.installments = installments || 1;
        paymentData.payment_method_id = payerInfo?.payment_method_id;
        if (issuer_id) {
          paymentData.issuer_id = issuer_id;
        }
        paymentData.payer = {
          email: payerInfo?.email || `user-${userId}@dosecerta.online`,
          identification: payerInfo?.identification || {
            type: "CPF",
            number: "00000000000"
          }
        };
        break;

      case 'pix':
        paymentData.payment_method_id = 'pix';
        paymentData.payer = {
          email: payerInfo?.email || `user-${userId}@dosecerta.online`,
          first_name: payerInfo?.first_name || "Usuário",
          last_name: payerInfo?.last_name || "DoseCerta"
        };
        break;

      case 'bolbancario':
        paymentData.payment_method_id = 'bolbancario';
        paymentData.payer = {
          email: payerInfo?.email || `user-${userId}@dosecerta.online`,
          first_name: payerInfo?.first_name || "Usuário",
          last_name: payerInfo?.last_name || "DoseCerta",
          identification: payerInfo?.identification || {
            type: "CPF",
            number: "00000000000"
          }
        };
        break;

      default:
        return new Response(JSON.stringify({ 
          error: "Método de pagamento não suportado" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log('💳 Creating transparent payment:', JSON.stringify(paymentData, null, 2));

    // Criar pagamento via API do MercadoPago
    let response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${userId}-${planName}-${Date.now()}`
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MercadoPago API Error:', response.status, errorText);
      
      // Fallback: se valor mínimo for rejeitado, tenta com 1.00
      if (response.status === 400 && /min|least|menor|minimum|transaction_amount/i.test(errorText)) {
        const retryData = { ...paymentData, transaction_amount: 1.00 };
        response = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": `${userId}-${planName}-${Date.now()}-retry`
          },
          body: JSON.stringify(retryData),
        });
        
        if (!response.ok) {
          const retryErrorText = await response.text();
          console.error('❌ MercadoPago API Error (retry):', response.status, retryErrorText);
          throw new Error(`MercadoPago error (retry with 1.00): ${response.status} - ${retryErrorText}`);
        }
      } else {
        throw new Error(`MercadoPago error: ${response.status} - ${errorText}`);
      }
    }

    const payment = await response.json();
    console.log('✅ Payment created successfully:', payment.id, payment.status);

    // Resposta adaptada para cada método de pagamento
    const responseData: any = {
      payment_id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      payment_method: paymentMethod
    };

    // Adicionar dados específicos do método
    if (paymentMethod === 'pix' && payment.point_of_interaction?.transaction_data) {
      responseData.qr_code = payment.point_of_interaction.transaction_data.qr_code;
      responseData.qr_code_base64 = payment.point_of_interaction.transaction_data.qr_code_base64;
      responseData.ticket_url = payment.point_of_interaction.transaction_data.ticket_url;
    }

    if (paymentMethod === 'bolbancario' && payment.transaction_details?.external_resource_url) {
      responseData.boleto_url = payment.transaction_details.external_resource_url;
    }

    if (paymentMethod === 'credit_card') {
      responseData.installments = payment.installments;
      responseData.payment_method_id = payment.payment_method_id;
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("❌ create-transparent-payment error:", error);
    return new Response(JSON.stringify({ 
      error: String(error?.message || error),
      details: "Erro interno do servidor"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
