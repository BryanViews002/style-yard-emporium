# Fix for Order Cancellation Issue

## Problem
Users cannot cancel their own orders because the database RLS (Row Level Security) policy only allows admins to update orders.

## Solution
A new migration has been created that adds a policy allowing users to cancel their own pending orders.

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
```bash
npx supabase db push
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of: `supabase/migrations/20251029000000_allow_users_to_cancel_orders.sql`
4. Click "Run"

## What the Fix Does
- Adds a new RLS policy: "Users can cancel their own pending orders"
- Allows authenticated users to update their own orders
- Only permits changing status from 'pending' to 'cancelled'
- Users can only cancel orders within 24 hours (enforced by frontend logic)

## Verification
After applying the migration:
1. Log in as a regular user (not admin)
2. Place a test order
3. Go to "My Orders" page
4. Click "Cancel Order" on a pending order
5. Confirm the cancellation
6. The order status should change to "cancelled"
