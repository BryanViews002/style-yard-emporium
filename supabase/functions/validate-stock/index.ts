import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Items array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const stockIssues = [];

    // Check stock for each item
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('id', item.productId)
        .single();

      if (error || !product) {
        stockIssues.push({
          productId: item.productId,
          issue: 'Product not found'
        });
        continue;
      }

      if (product.stock_quantity < item.quantity) {
        stockIssues.push({
          productId: item.productId,
          productName: product.name,
          requested: item.quantity,
          available: product.stock_quantity,
          issue: 'Insufficient stock'
        });
      }
    }

    if (stockIssues.length > 0) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          issues: stockIssues 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-stock:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
