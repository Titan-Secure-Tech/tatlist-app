-- Create order_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  metadata JSONB
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON public.order_status_history(changed_at);

-- Add function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (
      order_id,
      from_status,
      to_status,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.updated_by,
      jsonb_build_object(
        'order_number', NEW.order_number,
        'total', NEW.total,
        'fulfillment_type', NEW.fulfillment_type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log status changes
DROP TRIGGER IF EXISTS order_status_change_trigger ON public.orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Add updated_by column to orders table for tracking who made changes
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS status_notes TEXT;

-- Add RLS policies for order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view status history for their own orders
CREATE POLICY "Users can view own order status history"
  ON public.order_status_history
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Admins can view all status history
CREATE POLICY "Admins can view all order status history"
  ON public.order_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert status history (via trigger)
CREATE POLICY "Admins can insert order status history"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.order_status_history IS 'Audit trail of all order status changes';
COMMENT ON COLUMN public.order_status_history.from_status IS 'Previous status (NULL for initial status)';
COMMENT ON COLUMN public.order_status_history.to_status IS 'New status';
COMMENT ON COLUMN public.order_status_history.changed_by IS 'User who changed the status';
COMMENT ON COLUMN public.order_status_history.metadata IS 'Additional context about the status change';
COMMENT ON COLUMN public.orders.updated_by IS 'User who last updated the order';
COMMENT ON COLUMN public.orders.status_notes IS 'Notes about current order status';
