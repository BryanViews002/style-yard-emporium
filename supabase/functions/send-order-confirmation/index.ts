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
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
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

    console.log('Order confirmation prepared for:', order.email);
    console.log('Order number:', order.order_number);

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
            subject: `Order Confirmation - ${order.order_number}`,
            html: generateOrderConfirmationEmail(order),
          }),
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log('Email sent successfully:', emailData.id);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Order confirmation email sent successfully',
              emailId: emailData.id,
              order: {
                number: order.order_number,
                email: order.email,
                total: order.total_amount
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
            message: 'Order confirmation logged (email service unavailable)',
            order: {
              number: order.order_number,
              email: order.email,
              total: order.total_amount
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('RESEND_API_KEY not configured, logging order confirmation');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Order confirmation logged (email service not configured)',
          order: {
            number: order.order_number,
            email: order.email,
            total: order.total_amount
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-order-confirmation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateOrderConfirmationEmail(order: any): string {
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
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .order-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; }
        th { background: #f8f9fa; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #2c3e50; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Style Yard Emporium</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div class="order-details">
          <h3>Thank you for your order!</h3>
          <p>Your order <strong>${order.order_number}</strong> has been confirmed and is being processed.</p>
          
          <h4>Order Details:</h4>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          
          <h4>Shipping Address:</h4>
          <p>
            ${order.shipping_address.first_name} ${order.shipping_address.last_name}<br>
            ${order.shipping_address.address_line_1}<br>
            ${order.shipping_address.address_line_2 ? order.shipping_address.address_line_2 + '<br>' : ''}
            ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
            ${order.shipping_address.country}
          </p>
        </div>
        
        <h4>Order Items:</h4>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
          ${order.discount_amount > 0 ? `<p><strong>Discount:</strong> -$${order.discount_amount.toFixed(2)}</p>` : ''}
          <p><strong>Shipping:</strong> $${order.shipping_amount.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${order.tax_amount.toFixed(2)}</p>
          <p class="total"><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact us.</p>
          <p>Thank you for choosing Style Yard Emporium!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}