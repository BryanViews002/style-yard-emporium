# 🔐 Stripe 401 Error Fix - Authentication Failed

## ❌ PROBLEM: 401 Unauthorized Errors

You're seeing these errors:
```
merchant-ui-api.stripe.com/elements/wallet-config: 401
api.stripe.com/v1/payment_intents/.../confirm: 401
```

**This means:** Your Stripe API keys are **missing, incorrect, or mismatched**.

---

## 🔍 ROOT CAUSE ANALYSIS

### The 401 Error Means:

1. **Missing Keys** - Environment variables not set
2. **Wrong Keys** - Using test keys in production or vice versa
3. **Mismatched Keys** - Publishable key from one account, secret key from another
4. **Invalid Keys** - Keys are expired or revoked

### Your Setup Requires TWO Keys:

| Key Type | Where Used | Environment Variable |
|----------|------------|---------------------|
| **Publishable Key** | Frontend (Vercel) | `VITE_STRIPE_PUBLISHABLE_KEY` |
| **Secret Key** | Backend (Supabase) | `STRIPE_SECRET_KEY` |

⚠️ **CRITICAL:** Both keys must be from the **SAME Stripe account**!

---

## ✅ SOLUTION: Set Both Stripe Keys

### Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Click **Developers** → **API keys**
3. You'll see two keys:

**For Testing:**
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...` (click "Reveal test key")

**For Production:**
- Publishable key: `pk_live_...`
- Secret key: `sk_live_...` (click "Reveal live key")

⚠️ **Use TEST keys for now** until you're ready for production!

---

### Step 2: Set Frontend Key (Vercel)

1. Go to https://vercel.com/
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name:** `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Value:** `pk_test_...` (your publishable key)
   - **Environments:** Check all (Production, Preview, Development)
6. Click **Save**

---

### Step 3: Set Backend Key (Supabase)

1. Go to https://supabase.com/dashboard/
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Scroll to **Secrets**
5. Click **Add new secret**
6. Enter:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_test_...` (your secret key)
7. Click **Save**

---

### Step 4: Redeploy Everything

**Redeploy Vercel:**
```bash
# Option 1: Push to trigger auto-deploy
git commit --allow-empty -m "trigger redeploy"
git push

# Option 2: Manual redeploy in Vercel dashboard
# Go to Deployments → Click "..." → Redeploy
```

**Redeploy Supabase Functions:**
```bash
# Navigate to your project
cd "c:\Users\Bryan Joe\Documents\style-yard-emporium"

# Deploy the payment function
supabase functions deploy create-payment-intent --project-ref ngniknstgjpwgnyewpll
```

---

## 🔍 VERIFICATION CHECKLIST

### Check Frontend Key (Vercel)

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Verify `VITE_STRIPE_PUBLISHABLE_KEY` exists
4. Value should start with `pk_test_` or `pk_live_`
5. Should be set for all environments

### Check Backend Key (Supabase)

1. Go to Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Verify `STRIPE_SECRET_KEY` exists
4. Value should start with `sk_test_` or `sk_live_`

### Check Keys Match

⚠️ **CRITICAL CHECK:**
- If publishable key is `pk_test_...`, secret must be `sk_test_...`
- If publishable key is `pk_live_...`, secret must be `sk_live_...`
- Both must be from the **same Stripe account**

---

## 🧪 TEST THE FIX

### 1. Test Payment Flow

1. Visit your deployed site
2. Add a product to cart
3. Go to checkout
4. Use test card: **4242 4242 4242 4242**
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Click "Pay"

### 2. Expected Result

✅ **Success:**
- No 401 errors in console
- Payment processes successfully
- Order confirmation appears

❌ **Still Failing:**
- Check keys are set correctly
- Verify keys match (both test or both live)
- Check Supabase function logs

---

## 🔧 TROUBLESHOOTING

### Issue: Still Getting 401 Errors

**Check 1: Keys Are Set**
```bash
# Check Vercel environment variables
# Go to Vercel Dashboard → Settings → Environment Variables
# Verify VITE_STRIPE_PUBLISHABLE_KEY exists

# Check Supabase secrets
# Go to Supabase Dashboard → Settings → Edge Functions → Secrets
# Verify STRIPE_SECRET_KEY exists
```

**Check 2: Keys Are Correct Format**
- Publishable: Must start with `pk_test_` or `pk_live_`
- Secret: Must start with `sk_test_` or `sk_live_`

**Check 3: Keys Match**
- Both test (`pk_test_` + `sk_test_`)
- OR both live (`pk_live_` + `sk_live_`)
- NOT mixed!

**Check 4: Redeployed**
- Vercel must be redeployed after setting env vars
- Supabase function must be redeployed after setting secrets

---

### Issue: "Invalid API Key" Error

**Cause:** Using placeholder or invalid key

**Solution:**
1. Get real keys from Stripe Dashboard
2. Don't use `pk_test_your_key_here`
3. Copy actual keys from Stripe

---

### Issue: Keys Work Locally But Not on Vercel

**Cause:** Environment variables not set in Vercel

**Solution:**
1. Set `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
2. Must be set for Production environment
3. Redeploy after setting

---

### Issue: Payment Intent Creation Fails

**Cause:** Backend secret key not set in Supabase

**Solution:**
1. Set `STRIPE_SECRET_KEY` in Supabase Edge Functions
2. Redeploy the function
3. Check function logs for errors

---

## 📊 COMMON MISTAKES

### ❌ Mistake 1: Using Placeholder Keys
```
pk_test_your_publishable_key_here  ❌
sk_test_your_secret_key_here       ❌
```

### ✅ Correct: Real Keys
```
pk_test_51ABC123...xyz  ✅
sk_test_51ABC123...xyz  ✅
```

---

### ❌ Mistake 2: Mismatched Keys
```
Frontend: pk_test_... (Test)
Backend:  sk_live_... (Live)  ❌ MISMATCH!
```

### ✅ Correct: Matching Keys
```
Frontend: pk_test_... (Test)
Backend:  sk_test_... (Test)  ✅ MATCH!
```

---

### ❌ Mistake 3: Not Redeploying
```
1. Set environment variable
2. Don't redeploy           ❌
3. Old code still running
```

### ✅ Correct: Redeploy
```
1. Set environment variable
2. Redeploy application     ✅
3. New code with keys active
```

---

## 🔐 SECURITY BEST PRACTICES

### ✅ DO:
- Use test keys for development
- Use live keys only for production
- Set keys as environment variables
- Never commit keys to Git
- Rotate keys if exposed

### ❌ DON'T:
- Hardcode keys in code
- Share secret keys publicly
- Mix test and live keys
- Use same keys across accounts
- Commit `.env` files

---

## 📝 QUICK REFERENCE

### Environment Variables Needed

**Vercel (Frontend):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Supabase (Backend):**
```
STRIPE_SECRET_KEY=sk_test_...
```

### Where to Set Them

**Vercel:**
- Dashboard → Project → Settings → Environment Variables

**Supabase:**
- Dashboard → Project → Settings → Edge Functions → Secrets

### Redeploy Commands

**Vercel:**
```bash
git push  # Auto-deploys
```

**Supabase:**
```bash
supabase functions deploy create-payment-intent --project-ref ngniknstgjpwgnyewpll
```

---

## 🎯 STEP-BY-STEP FIX SUMMARY

1. ✅ Get Stripe keys from dashboard
2. ✅ Set `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
3. ✅ Set `STRIPE_SECRET_KEY` in Supabase
4. ✅ Verify keys match (both test or both live)
5. ✅ Redeploy Vercel
6. ✅ Redeploy Supabase function
7. ✅ Test payment with card 4242...
8. ✅ Verify no 401 errors

---

## 🆘 STILL HAVING ISSUES?

### Check Supabase Function Logs

1. Go to Supabase Dashboard
2. Edge Functions → `create-payment-intent`
3. Click **Logs**
4. Look for errors

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for Stripe errors
4. Check Network tab for 401 responses

### Verify Keys in Code

The keys should be loaded from environment variables:

**Frontend (`src/lib/stripe.ts`):**
```tsx
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
```

**Backend (`supabase/functions/create-payment-intent/index.ts`):**
```tsx
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
```

---

## 🎊 SUCCESS INDICATORS

### ✅ Payment Works When:

- No 401 errors in console
- Payment intent creates successfully
- Card form loads properly
- Payment processes without errors
- Order confirmation appears
- Webhook events received (if configured)

---

## 📞 FINAL CHECKLIST

Before testing:
- [ ] Got keys from Stripe Dashboard
- [ ] Set publishable key in Vercel
- [ ] Set secret key in Supabase
- [ ] Verified keys match (both test)
- [ ] Redeployed Vercel
- [ ] Redeployed Supabase function
- [ ] Cleared browser cache
- [ ] Ready to test

**After setting both keys and redeploying, the 401 errors will be gone!** 🚀
