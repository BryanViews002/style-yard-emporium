# Stripe Payment Integration Setup

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Supabase Edge Functions Environment Variables

In your Supabase project dashboard, go to Settings > Edge Functions and add these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Testing Payments

Use these test card numbers for testing:

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Deployment Notes

- Replace test keys with live keys for production
- Ensure webhook endpoints are configured for production
- Test thoroughly in Stripe's test mode before going live
