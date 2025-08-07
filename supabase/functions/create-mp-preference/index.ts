import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Preference } from "https://esm.sh/mercadopago@2.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, planName, amount, appUrl } = await req.json();
    if (!userId || !planName || !amount) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
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

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    const baseAppUrl = appUrl || Deno.env.get("APP_URL") || "https://teste.dosecerta.online";
    const functionsUrl = Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL");

    const preferenceData = {
      external_reference: userId,
      metadata: { userId, planName },
      items: [
        {
          id: `plano-${String(planName).toLowerCase()}`,
          title: `Plano ${planName} - DoseCerta`,
          description: `Assinatura do plano ${planName}`,
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "BRL",
          category_id: "education",
        },
      ],
      payment_methods: { installments: 12 },
      auto_return: "approved",
      back_urls: {
        success: `${baseAppUrl}/pricing?payment=success`,
        failure: `${baseAppUrl}/pricing?payment=failure`,
        pending: `${baseAppUrl}/pricing?payment=pending`,
      },
      notification_url: `${functionsUrl}/functions/v1/mercadopago-webhook-public`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    const created = await preference.create({ body: preferenceData as any });
    if (!created.id) {
      throw new Error("No preference ID returned");
    }

    return new Response(
      JSON.stringify({
        id: created.id,
        init_point: created.init_point,
        sandbox_init_point: created.sandbox_init_point,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-mp-preference error:", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

