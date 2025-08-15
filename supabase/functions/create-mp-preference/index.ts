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

    const baseAppUrl = appUrl || Deno.env.get("APP_URL") || "https://teste.dosecerta.online";
    const functionsUrl = Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL");

    // definir valor final (forçado via env ou informado), respeitando mínimo configurável
    const requestedAmount = Number(Deno.env.get('MP_FORCE_AMOUNT') || amount);
    const minAmount = Number(Deno.env.get('MP_MIN_AMOUNT') || '1.00');
    const finalUnitPrice = Number.isFinite(requestedAmount)
      ? Math.max(Number(requestedAmount.toFixed(2)), Math.max(0.01, minAmount))
      : Math.max(Number(amount.toFixed(2)), Math.max(0.01, minAmount));

    const preferenceData = {
      external_reference: userId,
      metadata: { userId, planName },
      items: [
        {
          id: `plano-${String(planName).toLowerCase()}`,
          title: `Plano ${planName} - DoseCerta`,
          description: `Assinatura do plano ${planName}`,
          quantity: 1,
          unit_price: finalUnitPrice,
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
      notification_url: `${functionsUrl}/mercadopago-webhook-public`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    // Chamada REST direta (SDK do MP não é compatível com Edge Runtime/Deno)
    let resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    if (!resp.ok) {
      const bodyText = await resp.text();
      // fallback: se MP rejeitar valor mínimo, tenta com 1.00
      if (resp.status === 400 && /min|least|menor|minimum|unit_price/i.test(bodyText)) {
        const retryData = {
          ...preferenceData,
          items: [{ ...preferenceData.items[0], unit_price: 1.00 }],
        };
        resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(retryData),
        });
        if (!resp.ok) {
          const retryText = await resp.text();
          throw new Error(`MercadoPago error (retry with 1.00): ${resp.status} - ${retryText}`);
        }
      } else {
        throw new Error(`MercadoPago error: ${resp.status} - ${bodyText}`);
      }
    }

    const created = await resp.json();
    if (!created?.id) throw new Error("No preference ID returned");

    return new Response(
      JSON.stringify({ id: created.id, init_point: created.init_point, sandbox_init_point: created.sandbox_init_point }),
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

