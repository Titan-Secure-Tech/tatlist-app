-- Migration: Add Database Functions for Aggregated Queries
-- Description: Creates optimized functions for common aggregate queries
-- Created: 2025-11-11
-- Note: These functions can be optionally used if the aggregated count approach becomes slow with large datasets

-- ============================================================================
-- Collection Statistics Function
-- ============================================================================

-- Function to get collection stats with product counts
-- This can be used as an alternative to the aggregated query approach
CREATE OR REPLACE FUNCTION get_collection_stats()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c.sort_order,
    c.created_at,
    c.updated_at,
    COUNT(p.id) AS product_count
  FROM collections c
  LEFT JOIN products p ON p.collection_id = c.id
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.sort_order, c.created_at, c.updated_at
  ORDER BY c.sort_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Category Statistics Function
-- ============================================================================

-- Function to get category stats with product counts for a specific collection
CREATE OR REPLACE FUNCTION get_category_stats(collection_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  collection_id UUID,
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cat.id,
    cat.name,
    cat.slug,
    cat.description,
    cat.image_url,
    cat.collection_id,
    cat.sort_order,
    cat.created_at,
    cat.updated_at,
    COUNT(p.id) AS product_count
  FROM categories cat
  LEFT JOIN products p ON p.category_id = cat.id
  WHERE cat.collection_id = collection_uuid
  GROUP BY cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.collection_id, cat.sort_order, cat.created_at, cat.updated_at
  ORDER BY cat.sort_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Product Search with Filters Function
-- ============================================================================

-- Function to get category filters (vendors and tags) for a specific category
CREATE OR REPLACE FUNCTION get_category_filters(category_slug TEXT)
RETURNS TABLE (
  vendors JSONB,
  tags JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (
      SELECT jsonb_agg(DISTINCT jsonb_build_object('id', v.id, 'name', v.name, 'slug', v.slug))
      FROM vendors v
      INNER JOIN products p ON p.vendor_id = v.id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE c.slug = category_slug
    ) AS vendors,
    (
      SELECT jsonb_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
      FROM tags t
      INNER JOIN product_tags pt ON pt.tag_id = t.id
      INNER JOIN products p ON p.id = pt.product_id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE c.slug = category_slug
      LIMIT 50
    ) AS tags;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Optional: Materialized View for Very Large Catalogs
-- ============================================================================

-- This materialized view is OPTIONAL and should only be used if you have 10,000+ products
-- It provides pre-computed collection stats for extremely fast lookups
-- Uncomment and use only if needed

/*
CREATE MATERIALIZED VIEW IF NOT EXISTS collection_product_counts AS
SELECT
  c.id AS collection_id,
  c.name AS collection_name,
  c.slug AS collection_slug,
  COUNT(p.id) AS product_count
FROM collections c
LEFT JOIN products p ON p.collection_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY c.sort_order ASC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_product_counts_id
ON collection_product_counts(collection_id);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_collection_product_counts()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY collection_product_counts;
END;
$$ LANGUAGE plpgsql;

-- Optionally, create a trigger to refresh on product changes
-- (This can be expensive on high-traffic sites, consider scheduled refresh instead)
*/

-- ============================================================================
-- Comments and Documentation
-- ============================================================================

COMMENT ON FUNCTION get_collection_stats() IS 'Returns all collections with their product counts. Alternative to aggregated queries for very large datasets.';
COMMENT ON FUNCTION get_category_stats(UUID) IS 'Returns categories for a collection with their product counts. Alternative to aggregated queries for very large datasets.';
COMMENT ON FUNCTION get_category_filters(TEXT) IS 'Returns available vendors and tags for a specific category, used for filter dropdowns.';

-- ============================================================================
-- Usage Examples
-- ============================================================================

/*
-- Get collection stats
SELECT * FROM get_collection_stats();

-- Get category stats for a specific collection
SELECT * FROM get_category_stats('collection-uuid-here');

-- Get filters for a category
SELECT * FROM get_category_filters('category-slug');

-- If using materialized view:
-- Refresh the view (run periodically, e.g., every hour)
SELECT refresh_collection_product_counts();
*/

-- ============================================================================
-- Verify Functions
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Aggregate functions migration completed successfully';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE 'Optional materialized view: commented out (uncomment only if needed for 10,000+ products)';
  RAISE NOTICE 'Current approach (aggregated queries) is optimal for catalogs under 10,000 products';
END $$;
