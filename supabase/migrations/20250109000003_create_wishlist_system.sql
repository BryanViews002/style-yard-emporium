-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One wishlist entry per user per product
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to view their own wishlist" ON wishlists
FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to add to their own wishlist" ON wishlists
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to remove from their own wishlist" ON wishlists
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create function to check if product is in wishlist
CREATE OR REPLACE FUNCTION is_product_in_wishlist(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM wishlists 
    WHERE user_id = p_user_id AND product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user wishlist with product details
CREATE OR REPLACE FUNCTION get_user_wishlist(p_user_id UUID)
RETURNS TABLE (
  wishlist_id UUID,
  product_id UUID,
  product_name VARCHAR,
  product_slug VARCHAR,
  product_price DECIMAL,
  product_image TEXT,
  product_brand VARCHAR,
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
