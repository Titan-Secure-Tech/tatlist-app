-- Add Square integration columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS square_catalog_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS square_variation_id TEXT,
  ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS square_updated_at TIMESTAMPTZ;

-- Create index for Square catalog ID lookups
CREATE INDEX IF NOT EXISTS idx_products_square_catalog_id ON public.products(square_catalog_id);

-- Create index for sync source
CREATE INDEX IF NOT EXISTS idx_products_sync_source ON public.products(sync_source);

-- Comment on columns
COMMENT ON COLUMN public.products.square_catalog_id IS 'Square catalog item ID for syncing';
COMMENT ON COLUMN public.products.square_variation_id IS 'Primary Square variation ID';
COMMENT ON COLUMN public.products.variations IS 'JSON array of all product variations';
COMMENT ON COLUMN public.products.sync_source IS 'Source of product data (manual, square, firecrawl)';
COMMENT ON COLUMN public.products.square_updated_at IS 'Last update timestamp from Square';
