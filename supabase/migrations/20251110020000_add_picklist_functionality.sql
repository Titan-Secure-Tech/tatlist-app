-- Add picklist-related columns to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS picked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS picked_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS packed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster picklist queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_picked_at ON public.order_items(picked_at);
CREATE INDEX IF NOT EXISTS idx_order_items_packed_at ON public.order_items(packed_at);

-- Add delivery_date to orders for picklist filtering
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS pickup_location TEXT;

-- Create index for delivery date filtering
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Add comments for documentation
COMMENT ON COLUMN public.order_items.picked_at IS 'Timestamp when item was marked as picked';
COMMENT ON COLUMN public.order_items.picked_by IS 'User ID of the person who picked the item';
COMMENT ON COLUMN public.order_items.packed_at IS 'Timestamp when item was marked as packed';
COMMENT ON COLUMN public.order_items.packed_by IS 'User ID of the person who packed the item';
COMMENT ON COLUMN public.orders.delivery_date IS 'Scheduled delivery or pickup date';
COMMENT ON COLUMN public.orders.pickup_location IS 'Pickup location name (e.g., Stigma Ink, Black Eye Store)';
