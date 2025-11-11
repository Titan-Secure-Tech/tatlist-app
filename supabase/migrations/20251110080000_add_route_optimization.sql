-- Migration: Add Route Optimization System
-- Description: Creates tables and functions for multi-stop delivery route optimization
-- Issue: #53 - Integrate Route Optimization for Deliveries

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Route status
CREATE TYPE route_status AS ENUM (
  'draft',        -- Route created but not yet active
  'active',       -- Route assigned and in progress
  'completed',    -- All stops completed
  'cancelled'     -- Route cancelled
);

-- Route stop status
CREATE TYPE route_stop_status AS ENUM (
  'pending',      -- Not yet visited
  'enroute',      -- Driver is heading to this stop
  'arrived',      -- Driver arrived at stop
  'completed',    -- Delivery completed at this stop
  'skipped'       -- Stop was skipped (customer unavailable, etc.)
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Routes: Groups of deliveries assigned to a driver for optimization
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  status route_status DEFAULT 'draft',

  -- Start/End locations
  start_location JSONB,  -- {lat, lng, address}
  end_location JSONB,    -- {lat, lng, address} - optional return point

  -- Optimization results
  optimized_waypoint_order INTEGER[],  -- [2, 0, 3, 1] = optimized visit order
  total_distance_miles DECIMAL(8,2),
  total_duration_minutes INTEGER,

  -- Time tracking
  estimated_start_time TIMESTAMPTZ,
  estimated_end_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Mapbox response cache (for displaying route on map)
  route_geometry JSONB,         -- Full route polyline from Mapbox
  turn_by_turn_directions JSONB,  -- Navigation instructions

  -- Metadata
  created_by UUID REFERENCES users(id),  -- Admin who created route
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes
  CONSTRAINT valid_driver CHECK (driver_id IS NOT NULL)
);

-- Route Stops: Individual delivery stops within a route
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,

  -- Sequencing
  stop_number INTEGER NOT NULL,           -- Position in optimized route (1, 2, 3...)
  original_stop_number INTEGER NOT NULL,  -- Original position before optimization

  -- Location data
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address JSONB NOT NULL,

  -- Time windows (business hours constraints)
  earliest_arrival TIME,  -- Don't arrive before this time
  latest_arrival TIME,    -- Must arrive before this time

  -- Actual tracking
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  time_spent_minutes INTEGER,

  -- Status
  status route_stop_status DEFAULT 'pending',
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(route_id, delivery_id),  -- Each delivery can only appear once per route
  UNIQUE(route_id, stop_number),  -- Each stop number must be unique within route
  CONSTRAINT valid_time_spent CHECK (time_spent_minutes IS NULL OR time_spent_minutes >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Routes indexes
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_created_at ON routes(created_at DESC);
CREATE INDEX idx_routes_active_driver ON routes(driver_id, status)
  WHERE status IN ('draft', 'active');

-- Route stops indexes
CREATE INDEX idx_route_stops_route ON route_stops(route_id);
CREATE INDEX idx_route_stops_delivery ON route_stops(delivery_id);
CREATE INDEX idx_route_stops_status ON route_stops(status);
CREATE INDEX idx_route_stops_sequence ON route_stops(route_id, stop_number);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- Routes Policies
CREATE POLICY "Drivers can view their own routes"
  ON routes
  FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own routes"
  ON routes
  FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Admins can manage all routes"
  ON routes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage routes"
  ON routes
  FOR ALL
  USING (true);

-- Route Stops Policies
CREATE POLICY "Drivers can view stops for their routes"
  ON route_stops
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_stops.route_id
      AND routes.driver_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update stops for their routes"
  ON route_stops
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_stops.route_id
      AND routes.driver_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_stops.route_id
      AND routes.driver_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all route stops"
  ON route_stops
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage route stops"
  ON route_stops
  FOR ALL
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get driver's active routes
CREATE OR REPLACE FUNCTION get_driver_active_routes(p_driver_id UUID)
RETURNS TABLE (
  route_id UUID,
  route_name VARCHAR,
  route_status route_status,
  total_stops INTEGER,
  completed_stops INTEGER,
  total_distance_miles DECIMAL,
  total_duration_minutes INTEGER,
  estimated_end_time TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS route_id,
    r.name AS route_name,
    r.status AS route_status,
    COUNT(rs.id)::INTEGER AS total_stops,
    COUNT(rs.id) FILTER (WHERE rs.status = 'completed')::INTEGER AS completed_stops,
    r.total_distance_miles,
    r.total_duration_minutes,
    r.estimated_end_time
  FROM routes r
  LEFT JOIN route_stops rs ON rs.route_id = r.id
  WHERE r.driver_id = p_driver_id
    AND r.status IN ('draft', 'active')
  GROUP BY r.id, r.name, r.status, r.total_distance_miles,
           r.total_duration_minutes, r.estimated_end_time
  ORDER BY r.created_at DESC;
END;
$$;

-- Function to calculate route completion percentage
CREATE OR REPLACE FUNCTION calculate_route_completion(p_route_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_stops INTEGER;
  v_completed_stops INTEGER;
  v_completion DECIMAL;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_stops, v_completed_stops
  FROM route_stops
  WHERE route_id = p_route_id;

  IF v_total_stops = 0 THEN
    RETURN 0;
  END IF;

  v_completion := (v_completed_stops::DECIMAL / v_total_stops::DECIMAL) * 100;

  RETURN ROUND(v_completion, 2);
END;
$$;

-- Function to get next stop for a route
CREATE OR REPLACE FUNCTION get_next_route_stop(p_route_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_stop_id UUID;
BEGIN
  SELECT id INTO v_next_stop_id
  FROM route_stops
  WHERE route_id = p_route_id
    AND status IN ('pending', 'enroute')
  ORDER BY stop_number ASC
  LIMIT 1;

  RETURN v_next_stop_id;
END;
$$;

-- Function to auto-complete route when all stops are done
CREATE OR REPLACE FUNCTION auto_complete_route()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_all_completed BOOLEAN;
BEGIN
  -- Check if all stops in the route are completed
  SELECT NOT EXISTS (
    SELECT 1 FROM route_stops
    WHERE route_id = NEW.route_id
      AND status NOT IN ('completed', 'skipped')
  ) INTO v_all_completed;

  -- If all stops are completed, mark route as completed
  IF v_all_completed THEN
    UPDATE routes
    SET
      status = 'completed',
      actual_end_time = now(),
      updated_at = now()
    WHERE id = NEW.route_id
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to auto-complete route
CREATE TRIGGER trigger_auto_complete_route
  AFTER UPDATE OF status ON route_stops
  FOR EACH ROW
  WHEN (NEW.status IN ('completed', 'skipped'))
  EXECUTE FUNCTION auto_complete_route();

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at
  BEFORE UPDATE ON route_stops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE routes IS 'Optimized delivery routes for drivers with multiple stops';
COMMENT ON TABLE route_stops IS 'Individual delivery stops within an optimized route';

COMMENT ON COLUMN routes.optimized_waypoint_order IS 'Array of indices showing optimized visit order from Mapbox';
COMMENT ON COLUMN routes.route_geometry IS 'Cached Mapbox route geometry for map display';
COMMENT ON COLUMN routes.turn_by_turn_directions IS 'Cached turn-by-turn navigation instructions';

COMMENT ON COLUMN route_stops.stop_number IS 'Position in optimized route sequence (1, 2, 3...)';
COMMENT ON COLUMN route_stops.original_stop_number IS 'Original position before route optimization';

COMMENT ON FUNCTION get_driver_active_routes IS 'Get all active/draft routes for a driver with completion stats';
COMMENT ON FUNCTION calculate_route_completion IS 'Calculate percentage of completed stops in a route';
COMMENT ON FUNCTION get_next_route_stop IS 'Get the next pending stop in a route';
COMMENT ON FUNCTION auto_complete_route IS 'Automatically mark route as completed when all stops are done';
