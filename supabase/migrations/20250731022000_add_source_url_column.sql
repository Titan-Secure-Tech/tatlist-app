-- Add source_url column to track product origin
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS source_url text;

-- Add index for source_url
CREATE INDEX IF NOT EXISTS idx_products_source_url ON public.products (source_url);

-- Add comment
COMMENT ON COLUMN public.products.source_url IS 'Original product URL from Lucky Supply or other sources';