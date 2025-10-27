# Email Troubleshooting Guide

## Issues Fixed

### 1. Missing Configuration
**Problem:** `send-order-status-update` function was not configured in `config.toml`
**Solution:** Added function configuration to enable deployment

### 2. No Error Handling
**Problem:** Email function calls had no error handling, causing silent failures
**Solution:** Added try-catch blocks with proper error logging and user notifications

### 3. Limited Status Updates
**Problem:** Emails only sent for "shipped" and "delivered" statuses
**Solution:** Now sends emails for all status changes (processing, shipped, delivered, cancelled)

## Deployment Steps

### Step 1: Deploy Edge Functions
Run the deployment script:
```powershell
.\deploy-email-functions.ps1
```

Or deploy manually:
```powershell
supabase functions deploy send-order-confirmation --project-ref ngniknstgjpwgnyewpll
supabase functions deploy send-order-status-update --project-ref ngniknstgjpwgnyewpll
```

### Step 2: Verify Environment Variables
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll/settings/functions
2. Ensure `RESEND_API_KEY` is set with your Resend API key (starts with `re_`)
3. The key should look like: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Verify Resend Configuration
1. Log in to [Resend Dashboard](https://resend.com/dashboard)
2. Check your API key is active
3. Verify you haven't exceeded your email quota
4. Check if your domain is verified (optional but recommended)

## Testing

### Test Order Confirmation Email
1. Place a test order through the checkout process
2. Check browser console for logs:
   - Look for "Order confirmation email sent:" (success)
   - Look for "Error sending order confirmation email:" (failure)
3. Check your email inbox (including spam folder)
4. Check Supabase Edge Function logs

### Test Status Update Email
1. Go to Admin Orders page
2. Update an order status to "processing", "shipped", or "delivered"
3. Check browser console for logs:
   - Look for "Status update email sent:" (success)
   - Look for "Error sending status update email:" (failure)
4. Check customer's email inbox
5. Check Supabase Edge Function logs

## Monitoring

### Browser Console
Open browser DevTools (F12) and check Console tab for:
- `Order confirmation email sent:` - Success
- `Error sending order confirmation email:` - Failure
- `Status update email sent:` - Success
- `Error sending status update email:` - Failure

### Supabase Logs
1. Go to: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll/logs/edge-functions
2. Filter by function name:
   - `send-order-confirmation`
   - `send-order-status-update`
3. Look for error messages or successful email IDs

### Resend Dashboard
1. Go to: https://resend.com/emails
2. Check recent email sends
3. Look for delivery status and any errors

## Common Issues & Solutions

### Issue: "Email service not configured"
**Cause:** `RESEND_API_KEY` not set in Supabase
**Solution:**
1. Get your API key from Resend dashboard
2. Go to Supabase Settings > Edge Functions
3. Add environment variable: `RESEND_API_KEY=re_your_key_here`
4. Redeploy functions

### Issue: "Email service unavailable"
**Cause:** Invalid API key or Resend service issue
**Solution:**
1. Verify API key is correct in Supabase
2. Check Resend dashboard for service status
3. Ensure API key has proper permissions
4. Check if you've exceeded rate limits

### Issue: Emails not received
**Possible Causes:**
1. **Spam folder** - Check recipient's spam/junk folder
2. **Domain not verified** - Using `noreply@styleyardemporium.com` without verification
3. **Rate limiting** - Exceeded Resend free tier (3,000 emails/month)
4. **Invalid email address** - Check order email is valid

**Solutions:**
1. Ask customers to check spam folder
2. Verify your domain in Resend (recommended for production)
3. Upgrade Resend plan if needed
4. Validate email addresses during checkout

### Issue: Function invocation fails
**Cause:** Function not deployed or configuration issue
**Solution:**
1. Redeploy functions: `.\deploy-email-functions.ps1`
2. Check `config.toml` has both functions listed
3. Verify functions are deployed in Supabase dashboard
4. Check function logs for specific errors

### Issue: Silent failures (no error shown)
**Cause:** This should now be fixed with error handling
**What to check:**
1. Open browser console (F12)
2. Look for error logs
3. You should see warnings if email fails
4. Order/status update should still succeed even if email fails

## Email Flow

### Order Confirmation Flow
1. User completes payment in checkout
2. `handlePaymentSuccess` is called
3. Inventory is updated
4. `send-order-confirmation` function is invoked
5. Function fetches order details from database
6. Function sends email via Resend API
7. Success/error is logged to console
8. User sees toast notification

### Status Update Flow
1. Admin updates order status
2. `updateOrderStatus` is called
3. Order status is updated in database
4. Status history entry is created
5. If status is not "pending", `send-order-status-update` is invoked
6. Function fetches order details
7. Function sends email via Resend API
8. Success/error is logged to console
9. Admin sees toast notification

## Email Templates

### Order Confirmation Email Includes:
- Order number
- Order date
- Customer email
- Shipping address
- Order items with images
- Pricing breakdown (subtotal, discount, shipping, tax, total)

### Status Update Email Includes:
- Order number
- New status with color-coded banner
- Order date and total
- Tracking information (if applicable)
- Order items summary

## Production Checklist

- [ ] RESEND_API_KEY is set in Supabase
- [ ] Both email functions are deployed
- [ ] Domain is verified in Resend (recommended)
- [ ] Test order confirmation email works
- [ ] Test status update emails work
- [ ] Monitor Supabase logs for errors
- [ ] Set up Resend webhooks for delivery tracking (optional)
- [ ] Configure email templates with your branding
- [ ] Update "from" email address to your verified domain

## Support

If issues persist:
1. Check all logs (browser console, Supabase, Resend)
2. Verify all environment variables are set
3. Test with a simple order
4. Contact Resend support if API issues persist
5. Check Supabase community forums for edge function issues

## Useful Links

- Supabase Project: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll
- Supabase Edge Functions Logs: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll/logs/edge-functions
- Resend Dashboard: https://resend.com/dashboard
- Resend Emails: https://resend.com/emails
- Resend API Docs: https://resend.com/docs
