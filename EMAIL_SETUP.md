# Email Service Setup (Resend)

## Overview

The Style Yard Emporium now includes email functionality for:

- Order confirmations
- Password reset emails
- Contact form notifications (future)

## Setup Instructions

### 1. Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Style Yard Emporium"
4. Copy the API key (starts with `re_`)

### 3. Configure Supabase Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions**
3. Add the following environment variable:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

### 4. Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `styleyardemporium.com`)
3. Follow the DNS verification steps
4. Update the `from` email in the functions to use your verified domain

## Testing

### Test Order Confirmation

1. Place a test order
2. Check the Supabase Edge Functions logs
3. Verify the email is sent successfully

### Test Password Reset

1. Go to the login page
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox for the reset email

## Email Templates

The system includes professionally designed HTML email templates for:

- **Order Confirmations**: Complete order details with items, pricing, and shipping info
- **Password Reset**: Secure password reset links with expiration

## Troubleshooting

### Common Issues

1. **"Email service not configured"**: RESEND_API_KEY not set in Supabase
2. **"Email service unavailable"**: API key invalid or quota exceeded
3. **Emails not received**: Check spam folder, verify domain settings

### Monitoring

- Check Supabase Edge Functions logs for email sending status
- Monitor Resend dashboard for delivery statistics
- Set up webhooks for delivery confirmations (advanced)

## Production Considerations

1. **Domain Verification**: Use your own verified domain
2. **Rate Limiting**: Resend has rate limits (check your plan)
3. **Monitoring**: Set up alerts for failed email deliveries
4. **Backup**: Consider backup email service for critical emails

## Cost

- Resend free tier: 3,000 emails/month
- Paid plans start at $20/month for 50,000 emails
- Perfect for small to medium e-commerce sites
