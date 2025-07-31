-- Add attachments column for PDFs and other documents
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT ARRAY[]::text[];

-- Add index for attachments
CREATE INDEX IF NOT EXISTS idx_products_attachments ON public.products USING GIN (attachments);

-- Add comment
COMMENT ON COLUMN public.products.attachments IS 'Array of URLs to product attachments like PDFs, safety sheets, etc.';