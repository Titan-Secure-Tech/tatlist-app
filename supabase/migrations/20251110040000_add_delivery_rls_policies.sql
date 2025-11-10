-- Enable RLS on deliveries table
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can manage deliveries" ON public.deliveries;

-- Admins can view and manage all deliveries
CREATE POLICY "Admins can manage all deliveries"
ON public.deliveries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Drivers can view their assigned deliveries
CREATE POLICY "Drivers can view their assigned deliveries"
ON public.deliveries
FOR SELECT
TO authenticated
USING (
  driver_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'driver'
  )
);

-- Drivers can update their assigned deliveries (status, actual_delivery_time, route)
CREATE POLICY "Drivers can update their assigned deliveries"
ON public.deliveries
FOR UPDATE
TO authenticated
USING (
  driver_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'driver'
  )
)
WITH CHECK (
  driver_id = auth.uid()
);

-- Customers can view deliveries for their orders
CREATE POLICY "Customers can view their order deliveries"
ON public.deliveries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = deliveries.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Service role retains full access
CREATE POLICY "Service role can manage deliveries"
ON public.deliveries
FOR ALL
USING (auth.role() = 'service_role');

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON public.deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_estimated_delivery_time ON public.deliveries(estimated_delivery_time);

-- Add helper function to get driver's active deliveries
CREATE OR REPLACE FUNCTION get_driver_active_deliveries(driver_user_id UUID)
RETURNS TABLE (
  delivery_id UUID,
  order_id UUID,
  order_number TEXT,
  customer_name TEXT,
  delivery_address JSONB,
  delivery_status delivery_status,
  order_status order_status,
  estimated_delivery_time TIMESTAMPTZ,
  total DECIMAL(10, 2),
  item_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS delivery_id,
    o.id AS order_id,
    o.order_number,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    o.delivery_address,
    d.status AS delivery_status,
    o.status AS order_status,
    d.estimated_delivery_time,
    o.total,
    COUNT(oi.id) AS item_count
  FROM public.deliveries d
  INNER JOIN public.orders o ON d.order_id = o.id
  INNER JOIN public.users u ON o.user_id = u.id
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  WHERE d.driver_id = driver_user_id
    AND d.status IN ('assigned', 'in_progress')
    AND o.status IN ('ready_for_pickup', 'out_for_delivery')
  GROUP BY d.id, o.id, u.first_name, u.last_name
  ORDER BY d.estimated_delivery_time ASC NULLS LAST, o.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_driver_active_deliveries(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_driver_active_deliveries IS 'Returns active deliveries for a specific driver with order and customer details';
