# 🚀 Style Yard Emporium - Complete Setup Guide

## Step 1: Environment Variables Setup

### Create `.env.local` file in your project root:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration (already configured)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmlrbnN0Z2pwd2dueWV3cGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzk2NDAsImV4cCI6MjA3MzkxNTY0MH0.W-alKu6HmRPlzZieJ8vqL-I8Z9k2mJOqilADQJvEmQU
VITE_SUPABASE_URL=https://ngniknstgjpwgnyewpll.supabase.co
```

### Get Your Stripe Keys:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Replace `pk_test_your_publishable_key_here` with your actual key

## Step 2: Supabase Environment Variables

### Go to your Supabase Dashboard:

1. Visit: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll
2. Go to **Settings** → **Edge Functions**
3. Add these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
RESEND_API_KEY=re_your_resend_api_key_here
SUPABASE_URL=https://ngniknstgjpwgnyewpll.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Get Your Keys:

- **Stripe Secret Key**: From [Stripe Dashboard](https://dashboard.stripe.com/apikeys) (starts with `sk_test_`)
- **Resend API Key**: From [Resend Dashboard](https://resend.com/api-keys) (starts with `re_`)
- **Supabase Service Role Key**: From Supabase Settings → API

## Step 3: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
supabase functions deploy send-order-confirmation
supabase functions deploy send-password-reset
supabase functions deploy validate-stock
supabase functions deploy seed-products
supabase functions deploy get-admin-users
supabase functions deploy handle-contact-form
supabase functions deploy send-order-status-update
supabase functions deploy upload-product-image
supabase functions deploy check-rate-limit
```

### Option B: Manual Deployment

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll)
2. Click **Edge Functions** in the sidebar
3. For each function, copy the code from `supabase/functions/[function-name]/index.ts`
4. Click **Deploy**

## Step 4: Seed Database with Products

### Run the seed function:

```bash
# Using Supabase CLI
supabase functions invoke seed-products

# Or manually via dashboard
# Go to Edge Functions → seed-products → Invoke
```

## Step 5: Create Admin User

### Option A: Using the bootstrap function

```sql
-- Run this in Supabase SQL Editor
SELECT bootstrap_first_admin('your-user-id-here');
```

### Option B: Manual creation

1. Create a user account through the app
2. Go to Supabase Dashboard → Authentication → Users
3. Copy the user ID
4. Go to Database → user_roles table
5. Insert: `user_id: [copied-id], role: 'admin'`

## Step 6: Test the Application

### Test Flow:

1. **Start the app**: `npm run dev`
2. **Create account**: Go to `/auth` and sign up
3. **Browse products**: Go to `/shop`
4. **Add to cart**: Add items to cart
5. **Checkout**: Go to `/checkout` and complete payment
6. **Admin access**: Go to `/admin` (if you're an admin)

## Step 7: Production Deployment

### For Production:

1. Replace test keys with live keys
2. Set up domain verification in Resend
3. Configure production Stripe webhooks
4. Update environment variables in your hosting platform

## Troubleshooting

### Common Issues:

- **CORS errors**: Make sure Edge Functions are deployed with proper CORS headers
- **Payment fails**: Check Stripe keys are correct
- **No products**: Run the seed function
- **Can't access admin**: Make sure you have admin role

### Support:

- Check Supabase Edge Functions logs
- Check browser console for errors
- Verify all environment variables are set correctly

## 🎉 You're Done!

Your Style Yard Emporium should now be fully functional with:

- ✅ User authentication
- ✅ Product browsing and cart
- ✅ Payment processing
- ✅ Order management
- ✅ Admin dashboard
- ✅ Email notifications
