-- Function to update product inventory
CREATE OR REPLACE FUNCTION public.update_inventory(p_product_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity + p_quantity
  WHERE id = p_product_id;
END;
$$;