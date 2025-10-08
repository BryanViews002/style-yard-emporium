import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action_type, user_id } = await req.json();
    const ip_address = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit rules (per hour)
    const rateLimits: Record<string, { max: number; window: number }> = {
      contact_form: { max: 5, window: 3600000 }, // 5 per hour
      review: { max: 10, window: 3600000 }, // 10 per hour
      login: { max: 10, window: 3600000 }, // 10 per hour
    };

    const limit = rateLimits[action_type];
    if (!limit) {
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check recent requests
    const windowStart = new Date(Date.now() - limit.window).toISOString();
    const query = supabase
      .from("rate_limit_logs")
      .select("*", { count: "exact", head: true })
      .eq("action_type", action_type)
      .gte("created_at", windowStart);

    if (user_id) {
      query.eq("user_id", user_id);
    } else {
      query.eq("ip_address", ip_address);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error checking rate limit:", error);
      return new Response(
        JSON.stringify({ allowed: true }), // Allow on error to not block users
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowed = (count || 0) < limit.max;

    // Log this request if allowed
    if (allowed) {
      await supabase.from("rate_limit_logs").insert({
        user_id,
        ip_address,
        action_type,
      });
    }

    return new Response(
      JSON.stringify({ 
        allowed,
        remaining: limit.max - (count || 0),
        reset_at: new Date(Date.now() + limit.window).toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});