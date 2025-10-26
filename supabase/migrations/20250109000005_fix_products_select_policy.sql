-- Fix missing SELECT policy for products table
-- This allows all users to view active products on the shop page

-- Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read active products
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Create policy to allow admins to view all products (including inactive ones)
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);
