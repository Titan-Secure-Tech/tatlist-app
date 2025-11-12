-- Migration: Relational Product Schema
-- This migration restructures the products table to support both Lucky Supply and Kingpin products
-- with proper relational modeling for vendors, collections, categories, and tags.

-- ============================================================================
-- 1. CREATE NEW RELATIONAL TABLES
-- ============================================================================

-- Vendors table (e.g., Lucky Supply, Kingpin, Solid Ink, Critical)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_slug ON vendors(slug);

-- Collections table (top-level category, e.g., "Tattoo Equipment & Supplies")
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_sort_order ON collections(sort_order);

-- Categories table (second-tier, e.g., "Tattoo Ink", "Power Supplies")
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_collection_id ON categories(collection_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Subcategories table (third-tier, e.g., "Black Ink", "1oz Bottles")
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_sort_order ON subcategories(sort_order);

-- Tags table (for flexible product tagging)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- ============================================================================
-- 2. UPDATE PRODUCTS TABLE WITH NEW RELATIONSHIPS
-- ============================================================================

-- Add new foreign key columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;

-- Add indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);

-- Add source-specific metadata columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_product_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_handle TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_collections BIGINT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_management TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_policy TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2);

-- Add indexes for Shopify fields
CREATE INDEX IF NOT EXISTS idx_products_shopify_product_id ON products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_products_shopify_handle ON products(shopify_handle);

-- ============================================================================
-- 3. CREATE JUNCTION TABLES FOR MANY-TO-MANY RELATIONSHIPS
-- ============================================================================

-- Product-Tag junction table (many-to-many)
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag_id ON product_tags(tag_id);

-- ============================================================================
-- 4. ADD FULL-TEXT SEARCH SUPPORT
-- ============================================================================

-- Add full-text search column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(brand, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);

-- Add trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ============================================================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for all catalog tables
CREATE POLICY "Public can view vendors" ON vendors FOR SELECT TO public USING (true);
CREATE POLICY "Public can view collections" ON collections FOR SELECT TO public USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT TO public USING (true);
CREATE POLICY "Public can view tags" ON tags FOR SELECT TO public USING (true);
CREATE POLICY "Public can view product_tags" ON product_tags FOR SELECT TO public USING (true);

-- Service role full access
CREATE POLICY "Service role full access to vendors" ON vendors FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to collections" ON collections FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to categories" ON categories FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to subcategories" ON subcategories FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to tags" ON tags FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access to product_tags" ON product_tags FOR ALL TO service_role USING (true);

-- ============================================================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SEED INITIAL DATA
-- ============================================================================

-- Insert common vendors
INSERT INTO vendors (slug, name, description) VALUES
  ('lucky-supply', 'Lucky Supply', 'Premium tattoo supplies and equipment'),
  ('kingpin', 'Kingpin Tattoo Supply', 'Professional tattoo supplies'),
  ('solid-ink', 'Solid Ink', 'High-quality tattoo ink'),
  ('critical', 'Critical', 'Professional tattoo power supplies'),
  ('cheyenne', 'Cheyenne', 'Premium tattoo cartridges and equipment')
ON CONFLICT (slug) DO NOTHING;

-- Insert common collections (top-level categories)
INSERT INTO collections (slug, name, sort_order) VALUES
  ('tattoo-equipment-supplies', 'Tattoo Equipment & Supplies', 1),
  ('tattoo-ink', 'Tattoo Ink', 2),
  ('power-supplies', 'Power Supplies', 3),
  ('needles-cartridges', 'Needles & Cartridges', 4),
  ('aftercare', 'Aftercare', 5),
  ('accessories', 'Accessories', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for products with all relationships
CREATE OR REPLACE VIEW products_with_relationships AS
SELECT
  p.*,
  v.name as vendor_name,
  v.slug as vendor_slug,
  col.name as collection_name,
  col.slug as collection_slug,
  cat.name as category_name,
  cat.slug as category_slug,
  sub.name as subcategory_name,
  sub.slug as subcategory_slug,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT t.slug) FILTER (WHERE t.slug IS NOT NULL) as tag_slugs
FROM products p
LEFT JOIN vendors v ON p.vendor_id = v.id
LEFT JOIN collections col ON p.collection_id = col.id
LEFT JOIN categories cat ON p.category_id = cat.id
LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, v.id, col.id, cat.id, sub.id;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE vendors IS 'Product vendors/brands (e.g., Lucky Supply, Kingpin)';
COMMENT ON TABLE collections IS 'Top-level product categorization';
COMMENT ON TABLE categories IS 'Second-tier product categorization under collections';
COMMENT ON TABLE subcategories IS 'Third-tier product categorization under categories';
COMMENT ON TABLE tags IS 'Flexible tagging system for products';
COMMENT ON TABLE product_tags IS 'Many-to-many relationship between products and tags';
