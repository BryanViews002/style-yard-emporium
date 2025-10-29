# Fix for 401 Unauthorized Errors

## Problem
Your website is showing 401 errors when trying to load products and categories:
```
Failed to load resource: the server responded with a status of 401 ()
ngniknstgjpwgnyewpll.supabase.co/rest/v1/products?select=*&is_active=eq.true
ngniknstgjpwgnyewpll.supabase.co/rest/v1/categories?select=*&order=name.asc
```

## Root Cause
The Supabase database has Row Level Security (RLS) enabled on the `products` and `categories` tables, but there are **no policies allowing anonymous (non-logged-in) users** to read these tables.

Current policies only allow:
- Authenticated users to view products (but this is broken)
- Admins to manage products and categories

This means visitors who aren't logged in cannot see any products or categories, breaking the shop page and home page.

## Solution
A new migration has been created that adds proper RLS policies to allow public access.

### Migration File
`supabase/migrations/20251029000001_fix_public_access_to_products_and_categories.sql`

### What It Does

1. **Products Table**
   - Allows anonymous AND authenticated users to view active products (`is_active = true`)
   - Allows admins to view ALL products (including inactive ones)

2. **Categories Table**
   - Allows everyone (anonymous and authenticated) to view all categories

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
```bash
npx supabase db push
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of: `supabase/migrations/20251029000001_fix_public_access_to_products_and_categories.sql`
4. Paste into the SQL editor
5. Click **Run**

### Option 3: Quick Fix via Dashboard (Temporary)
If you need an immediate fix:

1. Go to Supabase Dashboard → Authentication → Policies
2. Find the `products` table
3. Add new policy:
   - **Policy name:** "Public can view active products"
   - **Policy command:** SELECT
   - **Target roles:** anon, authenticated
   - **USING expression:** `is_active = true`

4. Find the `categories` table
5. Add new policy:
   - **Policy name:** "Public can view categories"
   - **Policy command:** SELECT
   - **Target roles:** anon, authenticated
   - **USING expression:** `true`

## Verification Steps

After applying the fix:

1. **Clear browser cache** or open an incognito window
2. Visit your website homepage
3. Navigate to the shop page
4. Verify products load without errors
5. Check browser console (F12) - should see no 401 errors
6. Test category filtering

## Why This Happened

RLS (Row Level Security) is a security feature that restricts database access. Your migrations created policies for admins but forgot to create policies for public (anonymous) access. This is a common oversight when setting up e-commerce sites.

## Security Considerations

✅ **Safe:** Allowing public read access to products and categories is standard for e-commerce
✅ **Secure:** Only active products are visible to the public
✅ **Protected:** Write operations (INSERT, UPDATE, DELETE) still require admin privileges
✅ **Privacy:** User data, orders, and profiles remain protected

## Related Tables That Should Remain Protected

These tables correctly require authentication and should NOT be made public:
- `orders` - User orders (protected)
- `order_items` - Order details (protected)
- `profiles` - User profiles (protected)
- `shipping_addresses` - User addresses (protected)
- `wishlists` - User wishlists (protected)
- `user_roles` - Admin roles (protected)

## Additional Tables That May Need Public Access

Consider if these need public read access:
- `product_images` - Product gallery images (likely yes)
- `product_reviews` - Customer reviews (likely yes)

If you encounter 401 errors on product detail pages, you may need to add similar policies for these tables.
