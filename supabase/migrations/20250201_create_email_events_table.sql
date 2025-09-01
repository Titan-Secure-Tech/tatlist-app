-- Create table for storing Mailgun webhook events
CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message_id TEXT,
    domain TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_data JSONB,
    severity TEXT,
    reason TEXT,
    delivery_status_code INT,
    delivery_status_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_email_events_recipient ON public.email_events(recipient);
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_timestamp ON public.email_events(timestamp);
CREATE INDEX idx_email_events_message_id ON public.email_events(message_id);

-- Enable RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only (webhooks need service role)
CREATE POLICY "Service role can manage email events" ON public.email_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);