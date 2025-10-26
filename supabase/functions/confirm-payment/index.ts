import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "false",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentIntentId, orderId } = await req.json();

    if (!paymentIntentId || !orderId) {
      return new Response(
        JSON.stringify({
          error: "Payment intent ID and order ID are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update order with payment intent ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: paymentIntentId,
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (orderError) {
      console.error("Error updating order:", orderError);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create order status history entry
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "pending",
      new_status: "paid",
      notes: "Payment completed via Stripe",
      changed_by: order.user_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          paymentIntentId: order.stripe_payment_intent_id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error confirming payment:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
