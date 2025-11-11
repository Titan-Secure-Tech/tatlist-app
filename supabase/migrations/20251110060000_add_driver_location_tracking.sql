-- Add location tracking columns to deliveries table
ALTER TABLE public.deliveries
ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMPTZ;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_deliveries_current_location ON public.deliveries(current_latitude, current_longitude)
WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deliveries_location_updated_at ON public.deliveries(location_updated_at)
WHERE location_updated_at IS NOT NULL;

-- Create driver_location_history table for tracking movement
CREATE TABLE IF NOT EXISTS public.driver_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(10, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  heading DECIMAL(5, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for location history queries
CREATE INDEX IF NOT EXISTS idx_driver_location_history_delivery ON public.driver_location_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_driver_location_history_driver ON public.driver_location_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_location_history_recorded_at ON public.driver_location_history(recorded_at DESC);

-- Enable RLS on driver_location_history
ALTER TABLE public.driver_location_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all location history
CREATE POLICY "Admins can view all location history"
ON public.driver_location_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Drivers can view their own location history
CREATE POLICY "Drivers can view their location history"
ON public.driver_location_history
FOR SELECT
TO authenticated
USING (
  driver_id = auth.uid()
);

-- Drivers can insert their own location history
CREATE POLICY "Drivers can insert their location"
ON public.driver_location_history
FOR INSERT
TO authenticated
WITH CHECK (
  driver_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'driver'
  )
);

-- Customers can view location history for their orders
CREATE POLICY "Customers can view location for their orders"
ON public.driver_location_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    INNER JOIN public.orders o ON d.order_id = o.id
    WHERE d.id = driver_location_history.delivery_id
    AND o.user_id = auth.uid()
  )
);

-- Service role retains full access
CREATE POLICY "Service role can manage location history"
ON public.driver_location_history
FOR ALL
USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON COLUMN public.deliveries.current_latitude IS 'Current latitude of driver (last known position)';
COMMENT ON COLUMN public.deliveries.current_longitude IS 'Current longitude of driver (last known position)';
COMMENT ON COLUMN public.deliveries.location_updated_at IS 'Timestamp when driver location was last updated';
COMMENT ON COLUMN public.deliveries.estimated_arrival_time IS 'Dynamically calculated ETA based on current location';

COMMENT ON TABLE public.driver_location_history IS 'Historical tracking of driver locations during deliveries';
COMMENT ON COLUMN public.driver_location_history.accuracy IS 'Location accuracy in meters';
COMMENT ON COLUMN public.driver_location_history.speed IS 'Speed in meters per second';
COMMENT ON COLUMN public.driver_location_history.heading IS 'Heading/bearing in degrees (0-360)';
