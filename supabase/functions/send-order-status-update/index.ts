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
    const { orderId, newStatus, trackingNumber } = await req.json();

    if (!orderId || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'Order ID and new status are required' }),
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
        subject: `Order Update — ${order.order_number} is now ${capitalize(newStatus)}`,
        html: generateStatusUpdateEmail(order, newStatus, trackingNumber),
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

    console.log('Status update email sent:', emailData.id);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status update email sent',
        emailId: emailData.id,
        order: { number: order.order_number, email: order.email, status: newStatus }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-order-status-update:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_CONFIG: Record<string, { title: string; message: string; color: string; emoji: string; bgColor: string; textColor: string }> = {
  pending: {
    title: "Order Received",
    message: "We've received your order and it's awaiting processing.",
    color: "#f59e0b",
    emoji: "📋",
    bgColor: "#fffbeb",
    textColor: "#92400e",
  },
  processing: {
    title: "Order Processing",
    message: "Great news! Your order is being carefully prepared.",
    color: "#3b82f6",
    emoji: "⚙️",
    bgColor: "#eff6ff",
    textColor: "#1e40af",
  },
  transporting: {
    title: "Out for Delivery",
    message: "Your order is on its way and will be with you soon!",
    color: "#8b5cf6",
    emoji: "🚚",
    bgColor: "#f5f3ff",
    textColor: "#5b21b6",
  },
  shipped: {
    title: "Order Shipped!",
    message: "Your order has been dispatched and is on its way to you.",
    color: "#10b981",
    emoji: "📦",
    bgColor: "#f0fdf4",
    textColor: "#065f46",
  },
  delivered: {
    title: "Order Delivered!",
    message: "Your order has been delivered. Enjoy your new items!",
    color: "#059669",
    emoji: "🎉",
    bgColor: "#ecfdf5",
    textColor: "#064e3b",
  },
  cancelled: {
    title: "Order Cancelled",
    message: "Your order has been cancelled. Contact us if you have any questions.",
    color: "#ef4444",
    emoji: "❌",
    bgColor: "#fef2f2",
    textColor: "#991b1b",
  },
  refunded: {
    title: "Order Refunded",
    message: "Your refund has been processed. Please allow 3-5 business days.",
    color: "#6b7280",
    emoji: "💰",
    bgColor: "#f9fafb",
    textColor: "#374151",
  },
};

function generateStatusUpdateEmail(order: any, newStatus: string, trackingNumber?: string): string {
  const config = STATUS_CONFIG[newStatus] || {
    title: "Order Update",
    message: `Your order status has been updated to ${capitalize(newStatus)}.`,
    color: "#6b7280",
    emoji: "📬",
    bgColor: "#f9fafb",
    textColor: "#374151",
  };

  const itemsHtml = order.order_items?.map((item: any) => `
    <tr>
      <td style="padding: 14px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
        <img src="${item.product_snapshot?.image || ''}" alt="${item.product_snapshot?.name || ''}"
          style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; display: block;">
      </td>
      <td style="padding: 14px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
        <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${item.product_snapshot?.name || 'Product'}</p>
        ${item.product_snapshot?.selectedSize ? `<p style="margin: 4px 0 0; color: #888; font-size: 12px;">Size: ${item.product_snapshot.selectedSize}</p>` : ''}
        <p style="margin: 4px 0 0; color: #888; font-size: 12px;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 14px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: middle; font-size: 14px; font-weight: 600; color: #1a1a1a;">
        ${formatNaira(item.total_price)}
      </td>
    </tr>
  `).join('') || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update — ${order.order_number}</title>
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
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Order Update</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:${config.bgColor};padding:32px 40px;text-align:center;border-bottom:1px solid ${config.color}22;">
              <div style="font-size:40px;margin-bottom:12px;">${config.emoji}</div>
              <h2 style="margin:0;color:${config.textColor};font-size:22px;font-weight:700;">${config.title}</h2>
              <p style="margin:10px 0 0;color:${config.textColor};font-size:14px;opacity:0.8;">${config.message}</p>
              <div style="display:inline-block;background:${config.color};color:#fff;padding:6px 18px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:16px;">${capitalize(newStatus)}</div>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                    <p style="margin:6px 0 0;color:#1a1a1a;font-size:15px;font-weight:700;">${order.order_number}</p>
                  </td>
                  <td style="width:50%;text-align:right;">
                    <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total</p>
                    <p style="margin:6px 0 0;color:#1a1a1a;font-size:15px;font-weight:700;">${formatNaira(order.total_amount)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${trackingNumber ? `
          <!-- Tracking Info -->
          <tr>
            <td style="padding:24px 40px;border-bottom:1px solid #f0f0f0;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;">
                <p style="margin:0 0 8px;color:#1e40af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📍 Tracking Information</p>
                <p style="margin:0;color:#1e3a8a;font-size:15px;font-weight:600;">Tracking #: ${trackingNumber}</p>
                ${order.tracking_url ? `<p style="margin:8px 0 0;"><a href="${order.tracking_url}" style="color:#3b82f6;font-size:14px;text-decoration:none;font-weight:600;">Track Your Package →</a></p>` : ''}
              </div>
            </td>
          </tr>` : ''}

          <!-- Items -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;margin-top:32px;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">Questions about your order? Reply to this email or contact us.</p>
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
