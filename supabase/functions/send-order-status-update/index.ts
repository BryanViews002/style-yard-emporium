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
    const { orderId, newStatus, trackingNumber } = await req.json();

    if (!orderId || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'Order ID and new status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    console.log('Order status update prepared for:', order.email);
    console.log('New status:', newStatus);

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Style Yard Emporium <noreply@styleyardemporium.com>',
            to: [order.email],
            subject: `Order Update - ${order.order_number}`,
            html: generateStatusUpdateEmail(order, newStatus, trackingNumber),
          }),
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log('Status update email sent successfully:', emailData.id);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Order status update email sent successfully',
              emailId: emailData.id,
              order: {
                number: order.order_number,
                email: order.email,
                status: newStatus
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const errorData = await emailResponse.json();
          console.error('Email sending failed:', errorData);
          throw new Error('Failed to send email');
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Fall back to logging if email fails
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order status update logged (email service unavailable)',
            order: {
              number: order.order_number,
              email: order.email,
              status: newStatus
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('RESEND_API_KEY not configured, logging order status update');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Order status update logged (email service not configured)',
          order: {
            number: order.order_number,
            email: order.email,
            status: newStatus
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-order-status-update:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateStatusUpdateEmail(order: any, newStatus: string, trackingNumber?: string): string {
  const statusMessages: { [key: string]: { title: string; message: string; color: string } } = {
    processing: {
      title: "Order Processing",
      message: "Your order is being prepared for shipment.",
      color: "#3B82F6"
    },
    shipped: {
      title: "Order Shipped!",
      message: "Your order has been shipped and is on its way to you.",
      color: "#10B981"
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been successfully delivered.",
      color: "#059669"
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled.",
      color: "#EF4444"
    }
  };

  const statusInfo = statusMessages[newStatus] || {
    title: "Order Update",
    message: `Your order status has been updated to ${newStatus}.`,
    color: "#6B7280"
  };

  const itemsHtml = order.order_items?.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.product_snapshot.image}" alt="${item.product_snapshot.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product_snapshot.name}</strong>
        ${item.product_snapshot.selectedSize ? `<br><small>Size: ${item.product_snapshot.selectedSize}</small>` : ''}
        ${item.product_snapshot.selectedColor ? `<br><small>Color: ${item.product_snapshot.selectedColor}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Update - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .status-banner { background: ${statusInfo.color}; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .order-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; }
        th { background: #f8f9fa; font-weight: bold; }
        .tracking-info { background: #e0f2fe; border: 1px solid #81d4fa; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Style Yard Emporium</h1>
          <h2>Order Update</h2>
        </div>
        
        <div class="status-banner">
          <h2 style="margin: 0; font-size: 24px;">${statusInfo.title}</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${statusInfo.message}</p>
        </div>
        
        <div class="order-details">
          <h3>Order Details:</h3>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
          
          ${trackingNumber ? `
            <div class="tracking-info">
              <h4>Tracking Information</h4>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              ${order.tracking_url ? `<p><strong>Track Your Package:</strong> <a href="${order.tracking_url}" style="color: #3B82F6;">Click Here</a></p>` : ''}
            </div>
          ` : ''}
        </div>
        
        <h4>Order Items:</h4>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact our support team.</p>
          <p>Thank you for choosing Style Yard Emporium!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
