-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to reviews" ON product_reviews
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create reviews" ON product_reviews
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to update their own reviews" ON product_reviews
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own reviews" ON product_reviews
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's average rating
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update product ratings
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Add rating columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS for helpful votes
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for helpful votes
CREATE POLICY "Allow public read access to helpful votes" ON review_helpful_votes
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to vote on reviews" ON review_helpful_votes
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to update their own votes" ON review_helpful_votes
FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own votes" ON review_helpful_votes
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create function to update helpful votes count
CREATE OR REPLACE FUNCTION update_helpful_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's helpful votes count
  UPDATE product_reviews 
  SET helpful_votes = (
    SELECT COUNT(*) 
    FROM review_helpful_votes 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update helpful votes count
CREATE TRIGGER trigger_update_helpful_votes
  AFTER INSERT OR UPDATE OR DELETE ON review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_helpful_votes();
