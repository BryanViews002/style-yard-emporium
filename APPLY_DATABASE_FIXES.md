# Apply Database Fixes - Quick Guide

You have **TWO** important database migrations that need to be applied:

## 1. Fix 401 Errors (CRITICAL - Apply First)
**File:** `supabase/migrations/20251029000001_fix_public_access_to_products_and_categories.sql`

**What it fixes:**
- ❌ Products not loading (401 errors)
- ❌ Categories not loading (401 errors)
- ❌ Product images not showing
- ❌ Product reviews not displaying

**Impact:** Without this, your website won't work for visitors who aren't logged in.

---

## 2. Allow Users to Cancel Orders
**File:** `supabase/migrations/20251029000000_allow_users_to_cancel_orders.sql`

**What it fixes:**
- ❌ Users can't cancel their own pending orders
- ❌ Only admins could update orders

**Impact:** Users will be able to cancel their own orders within 24 hours.

---

## How to Apply Both Fixes

### Method 1: Supabase CLI (Recommended - Applies Both)
```bash
cd "c:\Users\Bryan Joe\Documents\style-yard-emporium"
npx supabase db push
```

This will apply all pending migrations in order.

### Method 2: Supabase Dashboard (Manual)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Apply migrations in this order:

#### First Migration (401 Fix):
```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251029000001_fix_public_access_to_products_and_categories.sql
```
Click **Run**

#### Second Migration (Order Cancellation):
```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251029000000_allow_users_to_cancel_orders.sql
```
Click **Run**

---

## Verification After Applying

### Test 401 Fix:
1. Open your website in **incognito/private mode** (not logged in)
2. Visit the homepage - should load without errors
3. Go to /shop - products should display
4. Open browser console (F12) - should see NO 401 errors
5. Click on a product - images and reviews should load

### Test Order Cancellation:
1. Log in as a regular user (not admin)
2. Place a test order
3. Go to "My Orders"
4. Click "Cancel Order" on a pending order
5. Confirm cancellation
6. Order status should change to "cancelled"

---

## What Each Migration Does

### Migration 1: Public Access Fix
Creates RLS policies for:
- ✅ `products` - Anonymous users can view active products
- ✅ `categories` - Everyone can view all categories
- ✅ `product_images` - Everyone can view product images
- ✅ `product_reviews` - Everyone can view reviews
- ✅ Admins can still view/manage everything

### Migration 2: Order Cancellation
Creates RLS policy:
- ✅ Users can update their own orders (only to cancel)
- ✅ Only works on pending orders
- ✅ Only changes status from "pending" to "cancelled"
- ✅ Admins retain full order management

---

## Troubleshooting

### If you still see 401 errors after applying:
1. Clear browser cache
2. Check Supabase logs for policy errors
3. Verify migrations ran successfully in SQL Editor
4. Check that RLS is enabled on tables

### If order cancellation doesn't work:
1. Verify the migration ran successfully
2. Check that the order status is "pending"
3. Verify the order is less than 24 hours old
4. Check browser console for error messages

---

## Security Notes

✅ **Safe:** These migrations follow security best practices
✅ **Public data:** Products, categories, images, and reviews are meant to be public
✅ **Protected data:** User orders, profiles, and addresses remain secure
✅ **Admin access:** Admins retain full control over all data
