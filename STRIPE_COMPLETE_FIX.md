# 🔐 Complete Stripe 401 Fix Guide

## ❌ CURRENT ERROR

```
POST https://api.stripe.com/v1/payment_intents/.../confirm 401 (Unauthorized)
```

This means Stripe is rejecting your API key.

---

## 🎯 THE REAL PROBLEM

You have **placeholder keys** in your code that need to be replaced with **real Stripe keys**.

### What's Happening:
1. Code tries to use `VITE_STRIPE_PUBLISHABLE_KEY` from environment
2. Variable is not set in Vercel
3. Code falls back to invalid placeholder: `pk_test_your_publishable_key_here`
4. Stripe rejects the invalid key → 401 error

---

## ✅ COMPLETE FIX (Step-by-Step)

### STEP 1: Get Real Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:

```
Publishable key: pk_test_51ABC...xyz
Secret key: sk_test_51ABC...xyz (click "Reveal test key")
```

3. **Copy both keys** - you'll need them

---

### STEP 2: Set Frontend Key in Vercel

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** tab
4. Click **Environment Variables** in sidebar
5. Click **Add New** button
6. Fill in:
   ```
   Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_51ABC...xyz (paste your real key)
   ```
7. **Check ALL environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **Save**

---

### STEP 3: Set Backend Key in Supabase

1. Go to https://supabase.com/dashboard
2. Select your project: `ngniknstgjpwgnyewpll`
3. Click **Settings** (gear icon)
4. Click **Edge Functions** in sidebar
5. Scroll down to **Secrets** section
6. Click **Add new secret**
7. Fill in:
   ```
   Name: STRIPE_SECRET_KEY
   Value: sk_test_51ABC...xyz (paste your real secret key)
   ```
8. Click **Insert secret**

---

### STEP 4: Redeploy Everything

**A. Redeploy Vercel:**

Option 1 - Git Push (Recommended):
```bash
cd "c:\Users\Bryan Joe\Documents\style-yard-emporium"
git add .
git commit -m "fix: update stripe configuration"
git push
```

Option 2 - Manual Redeploy:
1. Go to Vercel Dashboard
2. Click **Deployments** tab
3. Find latest deployment
4. Click **...** menu → **Redeploy**

**B. Redeploy Supabase Function:**
```bash
cd "c:\Users\Bryan Joe\Documents\style-yard-emporium"
supabase functions deploy create-payment-intent --project-ref ngniknstgjpwgnyewpll
```

---

### STEP 5: Clear Browser Cache

**Important:** Your browser has cached the old code with bad keys.

**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

Or:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

---

## 🧪 TEST THE FIX

### 1. Check Environment Variables

**Vercel:**
1. Go to Settings → Environment Variables
2. Verify `VITE_STRIPE_PUBLISHABLE_KEY` exists
3. Value should start with `pk_test_51`

**Supabase:**
1. Go to Settings → Edge Functions → Secrets
2. Verify `STRIPE_SECRET_KEY` exists
3. Value should start with `sk_test_51`

### 2. Test Payment

1. Visit your deployed site
2. Add a product to cart
3. Go to checkout
4. Fill in shipping details
5. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123 (any 3 digits)
   ZIP: 12345 (any 5 digits)
   ```
6. Click "Pay"

### 3. Expected Result

✅ **Success:**
- No 401 errors in console
- Payment processes
- Order confirmation appears
- Console shows: "Payment Successful!"

❌ **Still Failing:**
- Check keys are set correctly
- Verify you redeployed
- Clear browser cache again
- Check console for specific error

---

## 🔍 VERIFICATION CHECKLIST

Before testing, verify:

- [ ] Got real keys from Stripe Dashboard
- [ ] Keys start with `pk_test_51` and `sk_test_51`
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
- [ ] Set `STRIPE_SECRET_KEY` in Supabase
- [ ] Both keys are from the SAME Stripe account
- [ ] Redeployed Vercel (git push or manual)
- [ ] Redeployed Supabase function
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Waited 1-2 minutes for deployment

---

## ⚠️ COMMON MISTAKES

### ❌ Mistake 1: Not Setting Environment Variables
```
Code: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
Vercel: (not set)
Result: Uses placeholder → 401 error
```

### ✅ Fix: Set in Vercel
```
Vercel Environment Variables:
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51ABC...
```

---

### ❌ Mistake 2: Not Redeploying
```
1. Set environment variable ✅
2. Don't redeploy ❌
3. Old code still running → 401 error
```

### ✅ Fix: Always Redeploy
```
1. Set environment variable ✅
2. Git push or manual redeploy ✅
3. New code with keys active ✅
```

---

### ❌ Mistake 3: Keys Don't Match
```
Frontend: pk_test_51ABC... (Account A)
Backend:  sk_test_51XYZ... (Account B)
Result: Keys don't match → 401 error
```

### ✅ Fix: Use Same Account
```
Frontend: pk_test_51ABC... (Account A)
Backend:  sk_test_51ABC... (Account A)
Result: Keys match ✅
```

---

### ❌ Mistake 4: Using Placeholder Keys
```
pk_test_your_publishable_key_here ❌
sk_test_your_secret_key_here ❌
```

### ✅ Fix: Use Real Keys
```
pk_test_51ABC123DEF456... ✅
sk_test_51ABC123DEF456... ✅
```

---

## 🔧 TROUBLESHOOTING

### Issue: Still Getting 401 After Setting Keys

**Check 1: Keys Are Really Set**
```bash
# In Vercel Dashboard
Settings → Environment Variables
Look for: VITE_STRIPE_PUBLISHABLE_KEY

# In Supabase Dashboard
Settings → Edge Functions → Secrets
Look for: STRIPE_SECRET_KEY
```

**Check 2: Redeployed**
```bash
# Check latest deployment time
Vercel: Deployments tab → Should be recent
Supabase: Edge Functions → Check deploy time
```

**Check 3: Cleared Cache**
```
Hard refresh: Ctrl + Shift + R
Or clear all site data in DevTools
```

**Check 4: Keys Are Correct Format**
```
Publishable: pk_test_51... (51 characters minimum)
Secret: sk_test_51... (51 characters minimum)
```

---

### Issue: "VITE_STRIPE_PUBLISHABLE_KEY is not set" in Console

**Cause:** Environment variable not loaded

**Solution:**
1. Verify variable is set in Vercel
2. Variable name is EXACTLY: `VITE_STRIPE_PUBLISHABLE_KEY`
3. Redeploy after setting
4. Wait 1-2 minutes for deployment
5. Hard refresh browser

---

### Issue: Payment Intent Creates But Confirm Fails

**Cause:** Backend key is wrong or missing

**Solution:**
1. Check `STRIPE_SECRET_KEY` in Supabase
2. Must start with `sk_test_`
3. Must be from same account as publishable key
4. Redeploy Supabase function

---

## 📊 DEBUGGING STEPS

### 1. Check Browser Console

Open DevTools (F12) → Console tab

**Look for:**
```
✅ Good: "Payment intent created successfully"
❌ Bad: "CRITICAL: VITE_STRIPE_PUBLISHABLE_KEY is not set"
❌ Bad: "401 Unauthorized"
```

### 2. Check Network Tab

Open DevTools (F12) → Network tab

**Filter:** `stripe.com`

**Look for:**
- Payment intent creation: Should be 200 OK
- Payment confirm: Should be 200 OK
- If 401: Keys are wrong

### 3. Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions**
3. Click `create-payment-intent`
4. Click **Logs** tab
5. Look for errors

**Good log:**
```
Payment intent created successfully: pi_...
```

**Bad log:**
```
STRIPE_SECRET_KEY environment variable is not set
```

---

## 🎯 QUICK REFERENCE

### Environment Variables Needed

| Platform | Variable | Example Value | Where to Set |
|----------|----------|---------------|--------------|
| Vercel | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51ABC...` | Settings → Env Vars |
| Supabase | `STRIPE_SECRET_KEY` | `sk_test_51ABC...` | Settings → Edge Functions → Secrets |

### Redeploy Commands

```bash
# Vercel (auto-deploys on push)
git push

# Supabase Function
supabase functions deploy create-payment-intent --project-ref ngniknstgjpwgnyewpll
```

### Test Card

```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

---

## ✅ SUCCESS INDICATORS

### You'll know it's working when:

1. **No console errors**
   - No "CRITICAL: key not set" messages
   - No 401 errors
   - No Stripe API errors

2. **Payment processes**
   - Card form loads
   - "Processing..." appears
   - Success message shows

3. **Order completes**
   - Redirected to confirmation
   - Order appears in database
   - Email sent (if configured)

---

## 🆘 STILL NOT WORKING?

### Last Resort Checklist:

1. **Double-check keys from Stripe:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy keys again (don't type them)
   - Make sure you're copying the full key

2. **Delete and re-add environment variables:**
   - Remove old variables
   - Add new ones with fresh keys
   - Redeploy

3. **Check Stripe Dashboard:**
   - Go to Developers → API keys
   - Make sure keys are not restricted
   - Check if test mode is enabled

4. **Try different browser:**
   - Open in incognito/private mode
   - Test payment again
   - Rules out cache issues

5. **Check Stripe account status:**
   - Make sure account is active
   - No restrictions or holds
   - Test mode is enabled

---

## 📞 FINAL STEPS

### After Everything is Set:

1. ✅ Commit code changes
2. ✅ Push to trigger Vercel deploy
3. ✅ Deploy Supabase function
4. ✅ Wait 2 minutes for deployment
5. ✅ Clear browser cache
6. ✅ Test payment with 4242 card
7. ✅ Verify no 401 errors
8. ✅ Confirm order completes

---

## 🎊 SUMMARY

**Problem:** 401 Unauthorized from Stripe  
**Cause:** Missing or invalid API keys  
**Solution:** Set real keys in Vercel + Supabase  
**Action:** Set keys → Redeploy → Clear cache → Test  

**After following all steps, payments will work!** 🚀✨
