-- Migration: Add Geolocation Alert System
-- Description: Creates tables and functions for distance-based delivery alerts
-- Issue: #55 - Implement Geolocation Alerts

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Alert types supported by the system
CREATE TYPE alert_type AS ENUM (
  'eta_10_minutes',      -- Driver is 10 minutes away
  'eta_5_minutes',       -- Driver is 5 minutes away
  'arriving_now',        -- Driver is arriving (< 2 minutes)
  'distance_2_miles',    -- Driver is 2 miles away
  'distance_1_mile',     -- Driver is 1 mile away
  'distance_half_mile'   -- Driver is 0.5 miles away
);

-- Notification channels
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'both'
);

-- Alert status
CREATE TYPE alert_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'skipped'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Alert Thresholds: Configurable rules for triggering alerts
CREATE TABLE alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type alert_type NOT NULL UNIQUE,

  -- Threshold values
  distance_miles DECIMAL(5,2),        -- For distance-based alerts
  eta_minutes INTEGER,                -- For time-based alerts

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,         -- Higher = more important
  notification_channel notification_channel DEFAULT 'both',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Geolocation Alerts: Log of all alerts sent
CREATE TABLE geolocation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threshold_id UUID NOT NULL REFERENCES alert_thresholds(id),

  -- Alert details
  alert_type alert_type NOT NULL,
  status alert_status DEFAULT 'pending',

  -- Context at time of alert
  driver_latitude DECIMAL(10,8),
  driver_longitude DECIMAL(11,8),
  destination_latitude DECIMAL(10,8),
  destination_longitude DECIMAL(11,8),
  distance_miles DECIMAL(5,2),
  eta_minutes INTEGER,

  -- Notification details
  sent_via notification_channel,
  email_sent_at TIMESTAMPTZ,
  sms_sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Notification Preferences
CREATE TABLE customer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Channel preferences
  preferred_channel notification_channel DEFAULT 'both',
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Contact information
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,

  -- Alert preferences
  enable_eta_alerts BOOLEAN DEFAULT true,
  enable_distance_alerts BOOLEAN DEFAULT true,
  enable_arrival_alerts BOOLEAN DEFAULT true,

  -- Quiet hours (optional)
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes for alert queries
CREATE INDEX idx_geolocation_alerts_delivery ON geolocation_alerts(delivery_id);
CREATE INDEX idx_geolocation_alerts_order ON geolocation_alerts(order_id);
CREATE INDEX idx_geolocation_alerts_customer ON geolocation_alerts(customer_id);
CREATE INDEX idx_geolocation_alerts_type ON geolocation_alerts(alert_type);
CREATE INDEX idx_geolocation_alerts_status ON geolocation_alerts(status);
CREATE INDEX idx_geolocation_alerts_triggered_at ON geolocation_alerts(triggered_at DESC);

-- Composite index for duplicate detection
CREATE INDEX idx_geolocation_alerts_dedup ON geolocation_alerts(delivery_id, alert_type, triggered_at DESC);

CREATE INDEX idx_customer_notification_prefs_user ON customer_notification_preferences(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolocation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Alert Thresholds Policies
CREATE POLICY "Admins can manage alert thresholds"
  ON alert_thresholds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "All users can view alert thresholds"
  ON alert_thresholds
  FOR SELECT
  USING (true);

-- Geolocation Alerts Policies
CREATE POLICY "Customers can view their own alerts"
  ON geolocation_alerts
  FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all alerts"
  ON geolocation_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert alerts"
  ON geolocation_alerts
  FOR INSERT
  WITH CHECK (true);

-- Notification Preferences Policies
CREATE POLICY "Users can manage their own preferences"
  ON customer_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences"
  ON customer_notification_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if an alert was recently sent (deduplication)
CREATE OR REPLACE FUNCTION check_alert_already_sent(
  p_delivery_id UUID,
  p_alert_type alert_type,
  p_minutes_threshold INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM geolocation_alerts
    WHERE delivery_id = p_delivery_id
      AND alert_type = p_alert_type
      AND status IN ('sent', 'pending')
      AND triggered_at > now() - (p_minutes_threshold || ' minutes')::INTERVAL
  );
END;
$$;

-- Function to get customer notification preferences with defaults
CREATE OR REPLACE FUNCTION get_customer_notification_preferences(p_user_id UUID)
RETURNS customer_notification_preferences
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefs customer_notification_preferences;
BEGIN
  SELECT * INTO v_prefs
  FROM customer_notification_preferences
  WHERE user_id = p_user_id;

  -- Return default preferences if none exist
  IF v_prefs IS NULL THEN
    v_prefs := ROW(
      gen_random_uuid(),
      p_user_id,
      'both'::notification_channel,
      true,  -- email_enabled
      false, -- sms_enabled
      NULL,  -- phone_number
      false, -- phone_verified
      true,  -- enable_eta_alerts
      true,  -- enable_distance_alerts
      true,  -- enable_arrival_alerts
      NULL,  -- quiet_hours_start
      NULL,  -- quiet_hours_end
      now(), -- created_at
      now()  -- updated_at
    )::customer_notification_preferences;
  END IF;

  RETURN v_prefs;
END;
$$;

-- Function to calculate if customer is in quiet hours
CREATE OR REPLACE FUNCTION is_in_quiet_hours(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefs customer_notification_preferences;
  v_current_time TIME;
BEGIN
  SELECT * INTO v_prefs
  FROM customer_notification_preferences
  WHERE user_id = p_user_id;

  -- No quiet hours set
  IF v_prefs IS NULL OR v_prefs.quiet_hours_start IS NULL OR v_prefs.quiet_hours_end IS NULL THEN
    RETURN false;
  END IF;

  v_current_time := CURRENT_TIME;

  -- Check if current time is in quiet hours
  IF v_prefs.quiet_hours_start <= v_prefs.quiet_hours_end THEN
    -- Normal case: quiet hours within same day (e.g., 22:00 to 08:00 next day)
    RETURN v_current_time >= v_prefs.quiet_hours_start AND v_current_time <= v_prefs.quiet_hours_end;
  ELSE
    -- Overnight case: quiet hours span midnight (e.g., 22:00 to 08:00)
    RETURN v_current_time >= v_prefs.quiet_hours_start OR v_current_time <= v_prefs.quiet_hours_end;
  END IF;
END;
$$;

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

CREATE TRIGGER update_alert_thresholds_updated_at
  BEFORE UPDATE ON alert_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_notification_preferences_updated_at
  BEFORE UPDATE ON customer_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default alert thresholds
INSERT INTO alert_thresholds (alert_type, distance_miles, eta_minutes, is_enabled, priority, notification_channel) VALUES
  ('eta_10_minutes', NULL, 10, true, 3, 'both'),
  ('eta_5_minutes', NULL, 5, true, 2, 'both'),
  ('arriving_now', NULL, 2, true, 1, 'both'),
  ('distance_2_miles', 2.0, NULL, true, 3, 'both'),
  ('distance_1_mile', 1.0, NULL, true, 2, 'both'),
  ('distance_half_mile', 0.5, NULL, true, 1, 'both')
ON CONFLICT (alert_type) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE alert_thresholds IS 'Configurable rules for triggering geolocation alerts';
COMMENT ON TABLE geolocation_alerts IS 'Log of all geolocation alerts sent to customers';
COMMENT ON TABLE customer_notification_preferences IS 'Customer preferences for delivery notifications';

COMMENT ON FUNCTION check_alert_already_sent IS 'Prevents duplicate alerts within specified time window';
COMMENT ON FUNCTION get_customer_notification_preferences IS 'Returns customer preferences with sensible defaults';
COMMENT ON FUNCTION is_in_quiet_hours IS 'Checks if current time falls within customer quiet hours';
