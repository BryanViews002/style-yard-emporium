-- Fix wishlist function type mismatch
-- The function was returning VARCHAR types but products table uses TEXT

DROP FUNCTION IF EXISTS get_user_wishlist(UUID);

CREATE OR REPLACE FUNCTION get_user_wishlist(p_user_id UUID)
RETURNS TABLE (
  wishlist_id UUID,
  product_id UUID,
  product_name TEXT,
  product_slug TEXT,
  product_price DECIMAL,
  product_image TEXT,
  product_brand TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
