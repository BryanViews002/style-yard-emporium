-- ============================================================================
-- Fix 401 errors: Allow anonymous users to view products and categories
-- ============================================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;

-- Create new policy to allow EVERYONE (including anonymous users) to view active products
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Create policy to allow admins to view ALL products (including inactive ones)
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- ============================================================================
-- Fix categories table access
-- ============================================================================

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;

-- Create policy to allow EVERYONE (including anonymous users) to view categories
CREATE POLICY "Public can view categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- Ensure product_images and product_reviews also have proper public access
-- ============================================================================

-- Drop and recreate product_images policy to ensure it uses TO anon, authenticated
DROP POLICY IF EXISTS "Product images are publicly readable" ON public.product_images;

CREATE POLICY "Public can view product images"
ON public.product_images
FOR SELECT
TO anon, authenticated
USING (true);

-- Drop and recreate product_reviews policies to ensure they use TO anon, authenticated
DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews without user info" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.product_reviews;

CREATE POLICY "Public can view product reviews"
ON public.product_reviews
FOR SELECT
TO anon, authenticated
USING (true);

-- Add comments for clarity
COMMENT ON POLICY "Public can view active products" ON public.products IS 
'Allows anonymous and authenticated users to view active products in the shop';

COMMENT ON POLICY "Admins can view all products" ON public.products IS 
'Allows admin users to view all products including inactive ones';

COMMENT ON POLICY "Public can view categories" ON public.categories IS 
'Allows everyone to view all product categories';

COMMENT ON POLICY "Public can view product images" ON public.product_images IS 
'Allows everyone to view product images for the gallery';

COMMENT ON POLICY "Public can view product reviews" ON public.product_reviews IS 
'Allows everyone to view product reviews and ratings';
