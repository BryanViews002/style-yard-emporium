-- ============================================================================
-- Allow users to cancel their own pending orders
-- ============================================================================

-- Add policy to allow users to update their own orders, but only to cancel them
CREATE POLICY "Users can cancel their own pending orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'cancelled'
);

-- Add comment to explain the policy
COMMENT ON POLICY "Users can cancel their own pending orders" ON public.orders IS 
'Allows authenticated users to update their own orders, but only to change the status from pending to cancelled';
