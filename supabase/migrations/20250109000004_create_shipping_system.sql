-- Create shipping zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL, -- Array of country codes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_order_amount DECIMAL(10,2),
  base_rate DECIMAL(10,2) NOT NULL,
  per_item_rate DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order shipping table
CREATE TABLE IF NOT EXISTS order_shipping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_method VARCHAR(100) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  tracking_url TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone_id ON shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_order_shipping_order_id ON order_shipping(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipping_tracking ON order_shipping(tracking_number);

-- Enable RLS
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_shipping ENABLE ROW LEVEL SECURITY;

-- Create policies for shipping zones and rates (public read)
CREATE POLICY "Allow public read access to shipping zones" ON shipping_zones
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to shipping rates" ON shipping_rates
FOR SELECT USING (is_active = true);

-- Create policies for order shipping
CREATE POLICY "Allow users to view their own order shipping" ON order_shipping
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_shipping.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to create order shipping" ON order_shipping
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to update order shipping" ON order_shipping
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Insert default shipping zones and rates
INSERT INTO shipping_zones (name, description, countries) VALUES
('United States', 'Continental United States', ARRAY['US']),
('Canada', 'Canada', ARRAY['CA']),
('International', 'All other countries', ARRAY[]);

INSERT INTO shipping_rates (zone_id, name, description, base_rate, per_item_rate, free_shipping_threshold, estimated_days_min, estimated_days_max)
SELECT 
  sz.id,
  'Standard Shipping',
  'Standard ground shipping',
  9.99,
  1.99,
  100.00,
  5,
  7
FROM shipping_zones sz WHERE sz.name = 'United States';

INSERT INTO shipping_rates (zone_id, name, description, base_rate, per_item_rate, free_shipping_threshold, estimated_days_min, estimated_days_max)
SELECT 
  sz.id,
  'Express Shipping',
  'Express 2-day shipping',
  19.99,
  2.99,
  150.00,
  2,
  3
FROM shipping_zones sz WHERE sz.name = 'United States';

INSERT INTO shipping_rates (zone_id, name, description, base_rate, per_item_rate, free_shipping_threshold, estimated_days_min, estimated_days_max)
SELECT 
  sz.id,
  'Standard Shipping',
  'Standard shipping to Canada',
  14.99,
  2.99,
  150.00,
  7,
  10
FROM shipping_zones sz WHERE sz.name = 'Canada';

INSERT INTO shipping_rates (zone_id, name, description, base_rate, per_item_rate, free_shipping_threshold, estimated_days_min, estimated_days_max)
SELECT 
  sz.id,
  'International Shipping',
  'International shipping',
  24.99,
  4.99,
  200.00,
  10,
  21
FROM shipping_zones sz WHERE sz.name = 'International';

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_country_code VARCHAR(2),
  p_order_amount DECIMAL(10,2),
  p_item_count INTEGER
)
RETURNS TABLE (
  shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_free BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
