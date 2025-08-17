import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verificar autenticação
  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const paymentId = url.pathname.split('/').pop();

    if (!paymentId) {
      return new Response(JSON.stringify({ 
        error: "Payment ID é obrigatório" 
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

    console.log('🔍 Getting payment status for:', paymentId);

    // Consultar status do pagamento na API do MercadoPago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MercadoPago API Error:', response.status, errorText);
      
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: "Pagamento não encontrado" 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`MercadoPago error: ${response.status} - ${errorText}`);
    }

    const payment = await response.json();
    console.log('✅ Payment status retrieved:', payment.id, payment.status);

    // Resposta estruturada
    const responseData = {
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      date_created: payment.date_created,
      date_approved: payment.date_approved,
      date_last_updated: payment.date_last_updated,
      
      // Dados específicos por método de pagamento
      ...(payment.payment_method_id === 'pix' && payment.point_of_interaction?.transaction_data && {
        qr_code: payment.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
        ticket_url: payment.point_of_interaction.transaction_data.ticket_url,
      }),
      
      ...(payment.payment_method_id === 'bolbancario' && payment.transaction_details?.external_resource_url && {
        boleto_url: payment.transaction_details.external_resource_url,
      }),
      
      ...(payment.payment_type_id === 'credit_card' && {
        installments: payment.installments,
        card: payment.card ? {
          first_six_digits: payment.card.first_six_digits,
          last_four_digits: payment.card.last_four_digits,
          cardholder_name: payment.card.cardholder?.name,
        } : null,
      }),
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("❌ get-payment-status error:", error);
    return new Response(JSON.stringify({ 
      error: String(error?.message || error),
      details: "Erro ao consultar status do pagamento"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
