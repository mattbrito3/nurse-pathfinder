import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os planos
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, price, active')
      .order('price', { ascending: true });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      plans: plans
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
