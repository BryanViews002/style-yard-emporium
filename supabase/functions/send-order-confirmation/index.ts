import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Style Yard <noreply@thestyleyard.store>',
        to: [order.email],
        bcc: ['thestyleyardd@gmail.com'],
        subject: `Order Confirmed ✓ — ${order.order_number}`,
        html: generateOrderConfirmationEmail(order),
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend error:', emailData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order confirmation email sent:', emailData.id);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order confirmation email sent',
        emailId: emailData.id,
        order: { number: order.order_number, email: order.email, total: order.total_amount }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-order-confirmation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateOrderConfirmationEmail(order: any): string {
  const itemsHtml = order.order_items?.map((item: any) => `
    <tr>
      <td style="padding: 16px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
        <img src="${item.product_snapshot?.image || ''}" alt="${item.product_snapshot?.name || ''}" 
          style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; display: block;">
      </td>
      <td style="padding: 16px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${item.product_snapshot?.name || 'Product'}</p>
        ${item.product_snapshot?.selectedSize ? `<p style="margin: 4px 0 0; color: #888; font-size: 12px;">Size: ${item.product_snapshot.selectedSize}</p>` : ''}
        ${item.product_snapshot?.selectedColor ? `<p style="margin: 4px 0 0; color: #888; font-size: 12px;">Color: ${item.product_snapshot.selectedColor}</p>` : ''}
        <p style="margin: 4px 0 0; color: #888; font-size: 12px;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 16px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; text-align: right; font-weight: 600; color: #1a1a1a; font-size: 14px;">
        ${formatNaira(item.total_price)}
      </td>
    </tr>
  `).join('') || '';

  const addr = order.shipping_address || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — ${order.order_number}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#d4af37;font-size:28px;font-weight:300;letter-spacing:4px;text-transform:uppercase;">THE STYLE YARD</h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Order Confirmation</p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#f0fdf4;padding:28px 40px;text-align:center;border-bottom:1px solid #dcfce7;">
              <div style="display:inline-block;background:#22c55e;border-radius:50%;width:48px;height:48px;line-height:48px;text-align:center;font-size:22px;margin-bottom:12px;">✓</div>
              <h2 style="margin:0;color:#15803d;font-size:20px;font-weight:600;">Order Confirmed!</h2>
              <p style="margin:8px 0 0;color:#166534;font-size:14px;">Thank you for your purchase. We're getting your order ready.</p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                    <p style="margin:6px 0 0;color:#1a1a1a;font-size:15px;font-weight:700;">${order.order_number}</p>
                  </td>
                  <td style="width:50%;text-align:right;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date</p>
                    <p style="margin:6px 0 0;color:#1a1a1a;font-size:15px;font-weight:600;">${new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h3 style="margin:0 0 16px;color:#1a1a1a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Your Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;color:#666;font-size:14px;">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;color:#666;font-size:14px;">${formatNaira(order.subtotal || 0)}</td>
                </tr>
                ${order.discount_amount > 0 ? `
                <tr>
                  <td style="padding:4px 0;color:#22c55e;font-size:14px;">Discount</td>
                  <td style="padding:4px 0;text-align:right;color:#22c55e;font-size:14px;">-${formatNaira(order.discount_amount)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:4px 0;color:#666;font-size:14px;">Shipping</td>
                  <td style="padding:4px 0;text-align:right;color:#666;font-size:14px;">${order.shipping_amount > 0 ? formatNaira(order.shipping_amount) : 'FREE'}</td>
                </tr>
                <tr>
                  <td style="padding:16px 0 4px;border-top:2px solid #1a1a1a;color:#1a1a1a;font-size:16px;font-weight:700;">Total</td>
                  <td style="padding:16px 0 4px;border-top:2px solid #1a1a1a;text-align:right;color:#1a1a1a;font-size:18px;font-weight:700;">${formatNaira(order.total_amount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#f8f8f8;border-radius:12px;padding:20px;">
                <p style="margin:0 0 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
                <p style="margin:0;color:#1a1a1a;font-size:14px;line-height:1.6;">
                  ${addr.first_name || ''} ${addr.last_name || ''}<br>
                  ${addr.address_line_1 || ''}${addr.address_line_2 ? '<br>' + addr.address_line_2 : ''}<br>
                  ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}<br>
                  ${addr.country || ''}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">Questions? Contact us anytime.</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.3);font-size:11px;">© ${new Date().getFullYear()} The Style Yard. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}