-- Create product_images table for multiple product images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are publicly readable"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create review_votes table for helpful voting
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on reviews"
  ON public.review_votes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can see review votes"
  ON public.review_votes FOR SELECT
  USING (true);

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are publicly readable if active"
  ON public.coupons FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(coupon_id, user_id, order_id)
);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their coupon usage"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert coupon usage"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add coupon fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Create product bundles table
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundles are publicly readable if active"
  ON public.product_bundles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage bundles"
  ON public.product_bundles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create bundle_products table
CREATE TABLE IF NOT EXISTS public.bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundle products are publicly readable"
  ON public.bundle_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundle products"
  ON public.bundle_products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create rate_limit table for spam protection
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits"
  ON public.rate_limit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add review image support
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Create index on product images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_id_created ON public.rate_limit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_created ON public.rate_limit_logs(ip_address, created_at);

-- Function to validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code TEXT,
  user_id UUID,
  cart_total NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coupon_record RECORD;
  discount_amount NUMERIC;
  result JSONB;
BEGIN
  -- Get coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired coupon');
  END IF;
  
  -- Check minimum purchase
  IF cart_total < coupon_record.min_purchase_amount THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'Minimum purchase amount of $' || coupon_record.min_purchase_amount || ' required'
    );
  END IF;
  
  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    discount_amount := cart_total * (coupon_record.discount_value / 100);
    IF coupon_record.max_discount_amount IS NOT NULL AND discount_amount > coupon_record.max_discount_amount THEN
      discount_amount := coupon_record.max_discount_amount;
    END IF;
  ELSE
    discount_amount := coupon_record.discount_value;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'discount_amount', discount_amount,
    'discount_type', coupon_record.discount_type,
    'discount_value', coupon_record.discount_value
  );
END;
$$;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_coupon_used
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_coupon_usage();