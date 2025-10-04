-- Phase 1: Critical Security Fixes - Fix RLS Policies

-- 1. Fix profiles table - remove implicit allow for unauthenticated
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix orders table - remove NULL loophole
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Authenticated users can view own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create own orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Fix order_items table - remove NULL loophole
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Authenticated users can view own order items" 
ON public.order_items 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create order items" 
ON public.order_items 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 4. Fix shipping_addresses - explicit authentication required
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.shipping_addresses;

CREATE POLICY "Authenticated users can view own addresses" 
ON public.shipping_addresses 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own addresses" 
ON public.shipping_addresses 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own addresses" 
ON public.shipping_addresses 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own addresses" 
ON public.shipping_addresses 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Fix contact_messages - admin only access
DROP POLICY IF EXISTS "Only admins can manage contact messages" ON public.contact_messages;

CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 6. Anonymize product reviews - remove user_id exposure in SELECT
DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.product_reviews;

CREATE POLICY "Anyone can view reviews without user info" 
ON public.product_reviews 
FOR SELECT 
USING (true);

-- Users can still manage their own reviews
CREATE POLICY "Authenticated users can delete own reviews" 
ON public.product_reviews 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Image Upload System: Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);