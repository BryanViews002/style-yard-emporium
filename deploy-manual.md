# 🚀 Manual Function Deployment

## Quick Fix for CORS Issue

The payment form now works in development mode, but to enable real Stripe payments, you need to deploy the updated Edge Functions.

## Step-by-Step Deployment

### 1. Go to Supabase Dashboard

- Visit: https://supabase.com/dashboard
- Select your project

### 2. Update create-payment-intent Function

1. Click **Edge Functions** in the left sidebar
2. Click **create-payment-intent**
3. Replace ALL code with this:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "false",
};

serve(async (req) => {
  console.log(`Received ${req.method} request to create-payment-intent`);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Check if Stripe secret key is available
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "Stripe configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { amount, currency = "usd", metadata = {} } = await req.json();
    console.log(
      `Creating payment intent for amount: ${amount}, currency: ${currency}`
    );

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: "Amount is required and must be greater than 0",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Payment intent created successfully: ${paymentIntent.id}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
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
```

4. Click **Deploy**

### 3. Update confirm-payment Function

1. Click **confirm-payment**
2. Replace ALL code with this:

```typescript
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
```

3. Click **Deploy**

### 4. Set Environment Variables

Make sure these are set in your Supabase project settings:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

## After Deployment

1. **Test the payment form** - It should now work with real Stripe payments
2. **Development mode** - Will still work for testing without real charges
3. **Production ready** - Real payments will be processed through Stripe

## Current Status

✅ **Development Mode**: Works immediately (mock payments)
⏳ **Production Mode**: Will work after function deployment
✅ **CORS Fixed**: Multiple fallback methods implemented
✅ **Error Handling**: Graceful degradation and clear feedback
