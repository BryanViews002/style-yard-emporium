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
        to: [email],
        subject: 'Reset Your Password — The Style Yard',
        html: generatePasswordResetEmail(resetUrl),
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

    console.log('Password reset email sent:', emailData.id);
    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent', emailId: emailData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePasswordResetEmail(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — The Style Yard</title>
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
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Password Reset</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px 40px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:20px;">🔐</div>
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:22px;font-weight:700;">Reset Your Password</h2>
              <p style="margin:0 0 32px;color:#666;font-size:15px;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto;">
                We received a request to reset the password for your Style Yard account. 
                Click the button below to create a new password.
              </p>
              <a href="${resetUrl}" 
                style="display:inline-block;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:#d4af37;padding:16px 40px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Reset Password
              </a>
              <p style="margin:32px 0 16px;color:#999;font-size:13px;">Or copy and paste this link into your browser:</p>
              <p style="margin:0;background:#f4f4f4;border-radius:8px;padding:12px 16px;word-break:break-all;font-size:12px;color:#555;">${resetUrl}</p>
              <p style="margin:28px 0 0;color:#ef4444;font-size:13px;font-weight:600;">⏰ This link expires in 1 hour.</p>
              <p style="margin:12px 0 0;color:#999;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">Need help? Contact our support team.</p>
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
