-- Enhanced inventory management functions
-- This migration improves the inventory tracking system

-- Update the existing update_inventory function to include movement tracking
CREATE OR REPLACE FUNCTION public.update_inventory(
  p_product_id uuid, 
  p_quantity integer,
  p_movement_type text DEFAULT 'out',
  p_reason text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
  new_stock integer;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM public.products
  WHERE id = p_product_id;
  
  -- Calculate new stock based on movement type
  IF p_movement_type = 'in' THEN
    new_stock := current_stock + p_quantity;
  ELSIF p_movement_type = 'out' THEN
    new_stock := current_stock - p_quantity;
  ELSIF p_movement_type = 'adjustment' THEN
    new_stock := p_quantity; -- Direct adjustment
  ELSE
    RAISE EXCEPTION 'Invalid movement type: %', p_movement_type;
  END IF;
  
  -- Ensure stock doesn't go negative
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', current_stock, p_quantity;
  END IF;
  
  -- Update product stock
  UPDATE public.products
  SET stock_quantity = new_stock,
      updated_at = now()
  WHERE id = p_product_id;
  
  -- Record inventory movement
  INSERT INTO public.inventory_movements (
    product_id,
    movement_type,
    quantity,
    reason,
    reference_id,
    created_by
  ) VALUES (
    p_product_id,
    p_movement_type,
    p_quantity,
    p_reason,
    p_reference_id,
    auth.uid()
  );
END;
$$;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products(p_threshold integer DEFAULT 10)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  current_stock integer,
  sku text,
  category_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Function to get inventory movement history
CREATE OR REPLACE FUNCTION public.get_inventory_history(
  p_product_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  product_name text,
  movement_type text,
  quantity integer,
  reason text,
  created_at timestamp with time zone,
  created_by_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);

-- Add RLS policies for inventory movements
DROP POLICY IF EXISTS "Admins can view all inventory movements" ON public.inventory_movements;
CREATE POLICY "Admins can view all inventory movements"
ON public.inventory_movements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert inventory movements" ON public.inventory_movements;
CREATE POLICY "System can insert inventory movements"
ON public.inventory_movements
FOR INSERT
TO authenticated
WITH CHECK (true);
