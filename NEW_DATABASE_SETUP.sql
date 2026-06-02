-- ============================================================
-- STYLE YARD EMPORIUM - NEW DATABASE SETUP SCRIPT
-- Run this in your new Supabase project's SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_NEW_PROJECT_ID/sql/new
-- ============================================================

-- ============================================================
-- STEP 1: ENUM TYPES
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'staff');


-- ============================================================
-- STEP 2: TABLES (in dependency order)
-- ============================================================

-- categories (no dependencies)
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_slug_key UNIQUE (slug)
);

-- products
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image text NOT NULL,
    category_id uuid,
    stock_quantity integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sku text,
    brand text,
    color_options text[],
    size_options text[],
    weight numeric,
    dimensions jsonb,
    seo_title text,
    seo_description text,
    average_rating numeric(3,2) DEFAULT 0,
    total_reviews integer DEFAULT 0,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_slug_key UNIQUE (slug),
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_stock_quantity_check CHECK ((stock_quantity >= 0))
);

-- profiles
CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    first_name text,
    last_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- user_roles
CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'customer'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- coupons
CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    min_purchase_amount numeric,
    max_discount_amount numeric,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT coupons_pkey PRIMARY KEY (id),
    CONSTRAINT coupons_code_key UNIQUE (code)
);

-- orders
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    user_id uuid,
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    stripe_payment_intent_id text,
    shipping_address jsonb NOT NULL,
    billing_address jsonb,
    notes text,
    tracking_number text,
    tracking_url text,
    coupon_id uuid,
    discount_amount numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_order_number_key UNIQUE (order_number),
    CONSTRAINT orders_shipping_amount_check CHECK ((shipping_amount >= (0)::numeric)),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))),
    CONSTRAINT orders_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT orders_tax_amount_check CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);

-- order_items
CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    product_snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- order_status_history
CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    old_status text,
    new_status text NOT NULL,
    notes text,
    changed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_status_history_pkey PRIMARY KEY (id)
);

-- product_images
CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT product_images_pkey PRIMARY KEY (id)
);

-- product_reviews
CREATE TABLE public.product_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    is_verified_purchase boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    images jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_reviews_pkey PRIMARY KEY (id),
    CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

-- product_variants
CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    sku text,
    color text,
    size text,
    price_adjustment numeric DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_variants_pkey PRIMARY KEY (id)
);

-- product_bundles
CREATE TABLE public.product_bundles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    discount_percentage numeric NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT product_bundles_pkey PRIMARY KEY (id),
    CONSTRAINT product_bundles_discount_percentage_check CHECK (((discount_percentage > (0)::numeric) AND (discount_percentage <= (100)::numeric)))
);

-- bundle_products
CREATE TABLE public.bundle_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bundle_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bundle_products_pkey PRIMARY KEY (id)
);

-- coupon_usage
CREATE TABLE public.coupon_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    discount_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT coupon_usage_pkey PRIMARY KEY (id)
);

-- inventory_movements
CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    movement_type text NOT NULL,
    quantity integer NOT NULL,
    reason text,
    reference_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_movements_pkey PRIMARY KEY (id)
);

-- wishlists
CREATE TABLE public.wishlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wishlists_pkey PRIMARY KEY (id),
    CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id)
);

-- review_helpful_votes
CREATE TABLE public.review_helpful_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_helpful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT review_helpful_votes_pkey PRIMARY KEY (id),
    CONSTRAINT review_helpful_votes_review_id_user_id_key UNIQUE (review_id, user_id)
);

-- review_votes
CREATE TABLE public.review_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT review_votes_pkey PRIMARY KEY (id),
    CONSTRAINT review_votes_review_id_user_id_key UNIQUE (review_id, user_id),
    CONSTRAINT review_votes_vote_type_check CHECK ((vote_type = ANY (ARRAY['helpful'::text, 'not_helpful'::text])))
);

-- shipping_zones
CREATE TABLE public.shipping_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    countries text[] NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT shipping_zones_pkey PRIMARY KEY (id)
);

-- shipping_rates
CREATE TABLE public.shipping_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    zone_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    min_order_amount numeric(10,2) DEFAULT 0,
    max_order_amount numeric(10,2),
    base_rate numeric(10,2) NOT NULL,
    per_item_rate numeric(10,2) DEFAULT 0,
    free_shipping_threshold numeric(10,2),
    estimated_days_min integer,
    estimated_days_max integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT shipping_rates_pkey PRIMARY KEY (id)
);

-- order_shipping
CREATE TABLE public.order_shipping (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    zone_id uuid,
    rate_id uuid,
    shipping_method text,
    shipping_cost numeric(10,2) DEFAULT 0,
    estimated_delivery_date timestamp with time zone,
    tracking_number text,
    tracking_url text,
    carrier text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_shipping_pkey PRIMARY KEY (id)
);

-- shipping_addresses
CREATE TABLE public.shipping_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'US'::text NOT NULL,
    phone text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id)
);

-- contact_messages
CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'unread'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

-- rate_limit_logs
CREATE TABLE public.rate_limit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    ip_address text,
    action_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rate_limit_logs_pkey PRIMARY KEY (id)
);


-- ============================================================
-- STEP 3: FOREIGN KEYS
-- ============================================================

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.bundle_products
    ADD CONSTRAINT bundle_products_bundle_id_fkey FOREIGN KEY (bundle_id) REFERENCES public.product_bundles(id);

ALTER TABLE ONLY public.bundle_products
    ADD CONSTRAINT bundle_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);

ALTER TABLE ONLY public.review_helpful_votes
    ADD CONSTRAINT review_helpful_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.product_reviews(id);

ALTER TABLE ONLY public.review_votes
    ADD CONSTRAINT review_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.product_reviews(id);

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id);

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


-- ============================================================
-- STEP 4: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);


-- ============================================================
-- STEP 5: FUNCTIONS
-- ============================================================

-- Trigger: update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'TSY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Handle new user -> creates profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Handle new profile -> assigns customer role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'customer');
  RETURN NEW;
END;
$$;

-- Check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Bootstrap first admin (no admin exists yet)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Track order status change
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Increment coupon usage when order placed
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
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

-- Update product average rating
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products 
  SET 
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update helpful vote count on review
CREATE OR REPLACE FUNCTION public.update_helpful_votes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_reviews 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM review_helpful_votes 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update inventory with movement tracking
CREATE OR REPLACE FUNCTION public.update_inventory(p_product_id uuid, p_quantity integer, p_movement_type text DEFAULT 'out', p_reason text DEFAULT NULL, p_reference_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM public.products
  WHERE id = p_product_id;
  
  IF p_movement_type = 'in' THEN
    new_stock := current_stock + p_quantity;
  ELSIF p_movement_type = 'out' THEN
    new_stock := current_stock - p_quantity;
  ELSIF p_movement_type = 'adjustment' THEN
    new_stock := p_quantity;
  ELSE
    RAISE EXCEPTION 'Invalid movement type: %', p_movement_type;
  END IF;
  
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', current_stock, p_quantity;
  END IF;
  
  UPDATE public.products
  SET stock_quantity = new_stock,
      updated_at = now()
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (
    product_id, movement_type, quantity, reason, reference_id, created_by
  ) VALUES (
    p_product_id, p_movement_type, p_quantity, p_reason, p_reference_id, auth.uid()
  );
END;
$$;

-- Validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text, user_id uuid, cart_total numeric)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $_$
DECLARE
  coupon_record RECORD;
  discount_amount NUMERIC;
BEGIN
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired coupon');
  END IF;
  
  IF cart_total < coupon_record.min_purchase_amount THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', 'Minimum purchase amount of $' || coupon_record.min_purchase_amount || ' required'
    );
  END IF;
  
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
$_$;

-- Get user wishlist
CREATE OR REPLACE FUNCTION public.get_user_wishlist(p_user_id uuid)
RETURNS TABLE(wishlist_id uuid, product_id uuid, product_name text, product_slug text, product_price numeric, product_image text, product_brand text, created_at timestamp with time zone)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id as wishlist_id,
    p.id as product_id,
    p.name as product_name,
    p.slug as product_slug,
    p.price as product_price,
    p.image as product_image,
    p.brand as product_brand,
    w.created_at
  FROM wishlists w
  JOIN products p ON w.product_id = p.id
  WHERE w.user_id = p_user_id
  ORDER BY w.created_at DESC;
END;
$$;

-- Check if product is in wishlist
CREATE OR REPLACE FUNCTION public.is_product_in_wishlist(p_user_id uuid, p_product_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM wishlists 
    WHERE user_id = p_user_id AND product_id = p_product_id
  );
END;
$$;

-- Get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products(p_threshold integer DEFAULT 10)
RETURNS TABLE(product_id uuid, product_name text, current_stock integer, sku text, category_name text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.stock_quantity as current_stock,
    p.sku,
    c.name as category_name
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.stock_quantity <= p_threshold
    AND p.is_active = true
  ORDER BY p.stock_quantity ASC;
END;
$$;

-- Get inventory history
CREATE OR REPLACE FUNCTION public.get_inventory_history(p_product_id uuid DEFAULT NULL, p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, product_name text, movement_type text, quantity integer, reason text, created_at timestamp with time zone, created_by_name text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id,
    p.name as product_name,
    im.movement_type,
    im.quantity,
    im.reason,
    im.created_at,
    COALESCE(pr.first_name || ' ' || pr.last_name, 'System') as created_by_name
  FROM public.inventory_movements im
  JOIN public.products p ON im.product_id = p.id
  LEFT JOIN public.profiles pr ON im.created_by = pr.user_id
  WHERE (p_product_id IS NULL OR im.product_id = p_product_id)
  ORDER BY im.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Calculate shipping cost
CREATE OR REPLACE FUNCTION public.calculate_shipping_cost(p_country_code character varying, p_order_amount numeric, p_item_count integer)
RETURNS TABLE(shipping_method character varying, shipping_cost numeric, estimated_days_min integer, estimated_days_max integer, is_free boolean)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.name as shipping_method,
    CASE 
      WHEN sr.free_shipping_threshold IS NOT NULL AND p_order_amount >= sr.free_shipping_threshold THEN 0
      ELSE sr.base_rate + (sr.per_item_rate * p_item_count)
    END as shipping_cost,
    sr.estimated_days_min,
    sr.estimated_days_max,
    (sr.free_shipping_threshold IS NOT NULL AND p_order_amount >= sr.free_shipping_threshold) as is_free
  FROM shipping_zones sz
  JOIN shipping_rates sr ON sz.id = sr.zone_id
  WHERE sz.is_active = true 
    AND sr.is_active = true
    AND (
      p_country_code = ANY(sz.countries) 
      OR (sz.countries = ARRAY[]::TEXT[] AND p_country_code NOT IN (SELECT unnest(countries) FROM shipping_zones WHERE countries != ARRAY[]::TEXT[]))
    )
  ORDER BY shipping_cost ASC;
END;
$$;


-- ============================================================
-- STEP 6: TRIGGERS
-- ============================================================

-- Auto-create profile on auth user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-assign customer role on profile create
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Track order status changes
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.track_order_status_change();

-- Increment coupon usage when order has coupon
CREATE TRIGGER on_order_coupon_used
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();

-- Update product rating on review change
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR DELETE OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Update helpful votes count
CREATE TRIGGER trigger_update_helpful_votes
  AFTER INSERT OR DELETE OR UPDATE ON public.review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_helpful_votes();

-- Updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 8: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- PRODUCTS
CREATE POLICY "Active products are publicly readable" ON public.products FOR SELECT USING ((is_active = true));
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));

-- CATEGORIES
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));

-- PROFILES
CREATE POLICY "Users can view only their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert only their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update only their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- USER ROLES
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));

-- ORDERS
CREATE POLICY "Users can view only their own orders" ON public.orders FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can create only their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can cancel their own pending orders" ON public.orders FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND (status = 'pending'::text))) WITH CHECK (((auth.uid() = user_id) AND (status = 'cancelled'::text)));
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ORDER ITEMS
CREATE POLICY "Authenticated users can view own order items" ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM public.orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));
CREATE POLICY "Authenticated users can create order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1 FROM public.orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));

-- ORDER STATUS HISTORY
CREATE POLICY "Admins can view order status history" ON public.order_status_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert order status history" ON public.order_status_history FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- PRODUCT REVIEWS
CREATE POLICY "Allow public read access to reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews without user info" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create reviews" ON public.product_reviews FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Users can create reviews for their purchases" ON public.product_reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Allow users to update their own reviews" ON public.product_reviews FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Users can update their own reviews" ON public.product_reviews FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Allow users to delete their own reviews" ON public.product_reviews FOR DELETE USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Authenticated users can delete own reviews" ON public.product_reviews FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- REVIEW HELPFUL VOTES
CREATE POLICY "Allow public read access to helpful votes" ON public.review_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to vote on reviews" ON public.review_helpful_votes FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Allow users to update their own votes" ON public.review_helpful_votes FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Allow users to delete their own votes" ON public.review_helpful_votes FOR DELETE USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));

-- REVIEW VOTES
CREATE POLICY "Everyone can see review votes" ON public.review_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON public.review_votes USING ((auth.uid() = user_id));

-- WISHLISTS
CREATE POLICY "Allow users to view their own wishlist" ON public.wishlists FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Users can view only their own wishlist" ON public.wishlists FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Allow users to add to their own wishlist" ON public.wishlists FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Users can insert only to their own wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Allow users to remove from their own wishlist" ON public.wishlists FOR DELETE USING (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));
CREATE POLICY "Users can delete only from their own wishlist" ON public.wishlists FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- SHIPPING ADDRESSES
CREATE POLICY "Users can view only their own addresses" ON public.shipping_addresses FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert only their own addresses" ON public.shipping_addresses FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update only their own addresses" ON public.shipping_addresses FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete only their own addresses" ON public.shipping_addresses FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- SHIPPING ZONES & RATES
CREATE POLICY "Allow public read access to shipping zones" ON public.shipping_zones FOR SELECT USING ((is_active = true));
CREATE POLICY "Allow public read access to shipping rates" ON public.shipping_rates FOR SELECT USING ((is_active = true));

-- ORDER SHIPPING
CREATE POLICY "Allow users to view their own order shipping" ON public.order_shipping FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.orders WHERE ((orders.id = order_shipping.order_id) AND (orders.user_id = auth.uid())))));
CREATE POLICY "Allow authenticated users to create order shipping" ON public.order_shipping FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow admins to update order shipping" ON public.order_shipping FOR UPDATE USING ((EXISTS ( SELECT 1 FROM public.user_roles ur WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::public.app_role)))));

-- INVENTORY MOVEMENTS
CREATE POLICY "Admins can view all inventory movements" ON public.inventory_movements FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "Only admins can view inventory movements" ON public.inventory_movements FOR SELECT USING ((EXISTS ( SELECT 1 FROM public.user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));
CREATE POLICY "System can insert inventory movements" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

-- PRODUCT IMAGES
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- PRODUCT VARIANTS
CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING ((is_active = true));

-- PRODUCT BUNDLES
CREATE POLICY "Bundles are publicly readable if active" ON public.product_bundles FOR SELECT USING ((is_active = true));
CREATE POLICY "Admins can manage bundles" ON public.product_bundles USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- BUNDLE PRODUCTS
CREATE POLICY "Bundle products are publicly readable" ON public.bundle_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage bundle products" ON public.bundle_products USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- COUPONS
CREATE POLICY "Coupons are publicly readable if active" ON public.coupons FOR SELECT USING (((is_active = true) AND ((valid_until IS NULL) OR (valid_until > now()))));
CREATE POLICY "Admins can manage coupons" ON public.coupons USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- COUPON USAGE
CREATE POLICY "Users can view their coupon usage" ON public.coupon_usage FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "System can insert coupon usage" ON public.coupon_usage FOR INSERT WITH CHECK ((auth.uid() = user_id));

-- CONTACT MESSAGES
CREATE POLICY "Unauthenticated users can submit contact messages" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Only admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Only admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- RATE LIMIT LOGS
CREATE POLICY "Admins can view rate limits" ON public.rate_limit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- ============================================================
-- STEP 9: STORAGE BUCKET (product-images)
-- Run this separately if it fails - the bucket may need to be
-- created via the Supabase Dashboard UI instead.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public read access to product images" ON storage.objects FOR SELECT USING ((bucket_id = 'product-images'::text));
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'product-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'product-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role))) WITH CHECK (((bucket_id = 'product-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'product-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text)));
CREATE POLICY "Allow authenticated users to update product images" ON storage.objects FOR UPDATE USING (((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text)));
CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects FOR DELETE USING (((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text)));

-- ============================================================
-- DONE! Your database is now set up.
-- Next steps:
-- 1. Update your .env.local with the new VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
-- 2. Make yourself admin by running:
--    SELECT public.bootstrap_first_admin('YOUR_USER_UUID_HERE');
-- ============================================================
