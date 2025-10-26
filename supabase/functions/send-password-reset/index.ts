import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl } = await req.json();

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: 'Email and reset URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, password reset email not sent');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email logged (email service not configured)',
          email: email
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Style Yard Emporium <noreply@styleyardemporium.com>',
          to: [email],
          subject: 'Reset Your Password - Style Yard Emporium',
          html: generatePasswordResetEmail(resetUrl),
        }),
      });

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        console.log('Password reset email sent successfully:', emailData.id);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Password reset email sent successfully',
            emailId: emailData.id,
            email: email
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const errorData = await emailResponse.json();
        console.error('Password reset email sending failed:', errorData);
        throw new Error('Failed to send password reset email');
      }
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email logged (email service unavailable)',
          email: email
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePasswordResetEmail(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - Style Yard Emporium</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .content { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .button { display: inline-block; background: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Style Yard Emporium</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <h3>Reset Your Password</h3>
          <p>We received a request to reset your password for your Style Yard Emporium account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for choosing Style Yard Emporium!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
