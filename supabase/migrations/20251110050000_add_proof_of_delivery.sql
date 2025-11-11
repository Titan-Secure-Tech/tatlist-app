-- Add proof of delivery columns to deliveries table
ALTER TABLE public.deliveries
ADD COLUMN IF NOT EXISTS proof_photo_url TEXT,
ADD COLUMN IF NOT EXISTS proof_signature_data TEXT,
ADD COLUMN IF NOT EXISTS recipient_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Create storage bucket for delivery proof photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on delivery-proofs bucket
CREATE POLICY "Authenticated users can upload delivery proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'delivery-proofs'
  AND (
    -- Allow drivers to upload
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'driver'
    )
    OR
    -- Allow admins to upload
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
);

CREATE POLICY "Public can view delivery proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'delivery-proofs');

CREATE POLICY "Drivers and admins can update their delivery proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'delivery-proofs'
  AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('driver', 'admin')
    )
  )
);

CREATE POLICY "Drivers and admins can delete delivery proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'delivery-proofs'
  AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('driver', 'admin')
    )
  )
);

-- Add comments for documentation
COMMENT ON COLUMN public.deliveries.proof_photo_url IS 'URL to photo proof of delivery (Supabase Storage)';
COMMENT ON COLUMN public.deliveries.proof_signature_data IS 'Base64 encoded signature image data';
COMMENT ON COLUMN public.deliveries.recipient_name IS 'Name of person who received the delivery';
COMMENT ON COLUMN public.deliveries.delivery_notes IS 'Additional notes from driver about delivery';

-- Add index for faster queries filtering by proof completion
CREATE INDEX IF NOT EXISTS idx_deliveries_proof_photo ON public.deliveries(proof_photo_url) WHERE proof_photo_url IS NOT NULL;
