-- Performance Optimization: Add database indexes for faster queries

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Wishlist table indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_product ON wishlists(user_id, product_id);

-- Reviews table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Inventory movements indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category_id, price);
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category_id, created_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_products_category_id IS 'Speeds up product filtering by category';
COMMENT ON INDEX idx_products_price IS 'Speeds up product sorting by price';
COMMENT ON INDEX idx_orders_user_id IS 'Speeds up user order history queries';
COMMENT ON INDEX idx_orders_status IS 'Speeds up admin order filtering by status';
