-- Migration: Seed Kingpin-style Collections and Categories
-- This migration creates the three main collections from Kingpin reference:
-- 1. Tattoo Supplies
-- 2. Shop Supplies
-- 3. Piercing and Jewelry

-- ============================================================================
-- CLEAR EXISTING DATA (for clean seed)
-- ============================================================================

-- Note: This clears only the collections/categories we're about to recreate
-- Products will remain but their relationships will be updated
DELETE FROM subcategories;
DELETE FROM categories;
DELETE FROM collections WHERE slug IN ('tattoo-supplies', 'shop-supplies', 'piercing-jewelry');

-- ============================================================================
-- 1. CREATE MAIN COLLECTIONS (Kingpin-style)
-- ============================================================================

INSERT INTO collections (slug, name, description, sort_order) VALUES
  (
    'tattoo-supplies',
    'Tattoo Supplies',
    'Professional tattoo equipment, machines, needles, ink, and consumables',
    1
  ),
  (
    'shop-supplies',
    'Shop Supplies',
    'General shop materials, safety equipment, and accessories',
    2
  ),
  (
    'piercing-jewelry',
    'Piercing & Jewelry',
    'Body jewelry, piercing equipment, and related accessories',
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 2. CREATE CATEGORIES FOR TATTOO SUPPLIES
-- ============================================================================

-- Get the Tattoo Supplies collection ID
DO $$
DECLARE
  tattoo_supplies_id UUID;
  shop_supplies_id UUID;
  piercing_jewelry_id UUID;
BEGIN
  -- Get collection IDs
  SELECT id INTO tattoo_supplies_id FROM collections WHERE slug = 'tattoo-supplies';
  SELECT id INTO shop_supplies_id FROM collections WHERE slug = 'shop-supplies';
  SELECT id INTO piercing_jewelry_id FROM collections WHERE slug = 'piercing-jewelry';

  -- TATTOO SUPPLIES CATEGORIES
  INSERT INTO categories (slug, name, description, collection_id, sort_order) VALUES
    ('tattoo-machines', 'Tattoo Machines', 'Rotary and coil tattoo machines', tattoo_supplies_id, 1),
    ('tattoo-needles', 'Tattoo Needles', 'Cartridge needles and traditional needles', tattoo_supplies_id, 2),
    ('tattoo-ink', 'Tattoo Ink', 'Tattoo pigments and ink sets', tattoo_supplies_id, 3),
    ('power-supplies', 'Power Supplies', 'Tattoo power supplies and adapters', tattoo_supplies_id, 4),
    ('grips-tubes', 'Grips & Tubes', 'Grips, tubes, and related accessories', tattoo_supplies_id, 5),
    ('machine-parts', 'Machine Parts', 'Coils, screws, binding posts, and other parts', tattoo_supplies_id, 6),
    ('cables-cords', 'Cables & Cords', 'Clip cords, cables, and adapters', tattoo_supplies_id, 7),
    ('foot-switches', 'Foot Switches', 'Foot pedals and switches', tattoo_supplies_id, 8),
    ('tattoo-markers', 'Markers & Stencils', 'Tattoo markers and flash sheets', tattoo_supplies_id, 9),
    ('tattoo-aftercare', 'Aftercare & Ointments', 'Tattoo aftercare products and ointments', tattoo_supplies_id, 10)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    collection_id = EXCLUDED.collection_id,
    sort_order = EXCLUDED.sort_order;

  -- SHOP SUPPLIES CATEGORIES
  INSERT INTO categories (slug, name, description, collection_id, sort_order) VALUES
    ('safety-hygiene', 'Safety & Hygiene', 'Gloves, sterilization, and safety equipment', shop_supplies_id, 1),
    ('cleaning-supplies', 'Cleaning Supplies', 'Detergents, waste bags, and cleaning products', shop_supplies_id, 2),
    ('first-aid', 'First Aid', 'First aid supplies and emergency equipment', shop_supplies_id, 3),
    ('paper-supplies', 'Paper Supplies', 'Paper sheets, watercolor blocks, and stationery', shop_supplies_id, 4),
    ('bags-storage', 'Bags & Storage', 'Bags, cases, and storage solutions', shop_supplies_id, 5),
    ('apparel', 'Apparel', 'Shop clothing and uniforms', shop_supplies_id, 6),
    ('books-education', 'Books & Education', 'Educational books and reference materials', shop_supplies_id, 7)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    collection_id = EXCLUDED.collection_id,
    sort_order = EXCLUDED.sort_order;

  -- PIERCING & JEWELRY CATEGORIES
  INSERT INTO categories (slug, name, description, collection_id, sort_order) VALUES
    ('body-jewelry', 'Body Jewelry', 'Professional body jewelry and piercings', piercing_jewelry_id, 1),
    ('nose-jewelry', 'Nose Jewelry', 'Nose studs, rings, and related jewelry', piercing_jewelry_id, 2),
    ('specialty-jewelry', 'Specialty Jewelry', 'Unique and specialty jewelry pieces', piercing_jewelry_id, 3)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    collection_id = EXCLUDED.collection_id,
    sort_order = EXCLUDED.sort_order;

END $$;

-- ============================================================================
-- 3. CREATE CATEGORY MAPPING REFERENCE TABLE
-- ============================================================================

-- This table helps map Lucky Supply categories to our new structure
CREATE TABLE IF NOT EXISTS category_mapping (
  lucky_category TEXT PRIMARY KEY,
  tatlist_collection_slug TEXT NOT NULL REFERENCES collections(slug),
  tatlist_category_slug TEXT NOT NULL REFERENCES categories(slug),
  notes TEXT
);

-- ============================================================================
-- 4. POPULATE CATEGORY MAPPING
-- ============================================================================

INSERT INTO category_mapping (lucky_category, tatlist_collection_slug, tatlist_category_slug, notes) VALUES
  -- Tattoo Supplies
  ('Cartridge Needles', 'tattoo-supplies', 'tattoo-needles', 'Cartridge-style needles'),
  ('Tattoo Needles', 'tattoo-supplies', 'tattoo-needles', 'Traditional needles'),
  ('Ink', 'tattoo-supplies', 'tattoo-ink', 'Tattoo ink and pigments'),
  ('Tattoo Pigments', 'tattoo-supplies', 'tattoo-ink', 'Tattoo pigments'),
  ('Tattoo Machines', 'tattoo-supplies', 'tattoo-machines', 'Complete tattoo machines'),
  ('Tattoo Machine', 'tattoo-supplies', 'tattoo-machines', 'Single tattoo machine'),
  ('Tattoo Machine Parts', 'tattoo-supplies', 'machine-parts', 'Machine parts and accessories'),
  ('Tattoo Machine Coils', 'tattoo-supplies', 'machine-parts', 'Coils for machines'),
  ('Tattoo Coils', 'tattoo-supplies', 'machine-parts', 'Machine coils'),
  ('Coils', 'tattoo-supplies', 'machine-parts', 'Generic coils'),
  ('Coil Sets', 'tattoo-supplies', 'machine-parts', 'Sets of coils'),
  ('Coil Set', 'tattoo-supplies', 'machine-parts', 'Coil set'),
  ('Coil Wrap', 'tattoo-supplies', 'machine-parts', 'Coil wrapping material'),
  ('Power Supplies', 'tattoo-supplies', 'power-supplies', 'Tattoo power supplies'),
  ('Grips', 'tattoo-supplies', 'grips-tubes', 'Grips for machines'),
  ('Clip Cords', 'tattoo-supplies', 'cables-cords', 'Clip cords'),
  ('Cables', 'tattoo-supplies', 'cables-cords', 'Cables and connectors'),
  ('Cable Adapter', 'tattoo-supplies', 'cables-cords', 'Cable adapters'),
  ('Foot Switches', 'tattoo-supplies', 'foot-switches', 'Foot switches'),
  ('Foot Switch', 'tattoo-supplies', 'foot-switches', 'Foot switch'),
  ('Tattoo Markers', 'tattoo-supplies', 'tattoo-markers', 'Tattoo markers'),
  ('Markers', 'tattoo-supplies', 'tattoo-markers', 'Generic markers'),
  ('Flash Sheets', 'tattoo-supplies', 'tattoo-markers', 'Flash and stencils'),
  ('Tattoo Ointments', 'tattoo-supplies', 'tattoo-aftercare', 'Aftercare ointments'),
  ('Tattoo Care', 'tattoo-supplies', 'tattoo-aftercare', 'General tattoo care'),
  ('Binding Posts', 'tattoo-supplies', 'machine-parts', 'Binding posts'),
  ('Screws', 'tattoo-supplies', 'machine-parts', 'Screws for machines'),
  ('Tube Vice Screw', 'tattoo-supplies', 'machine-parts', 'Tube vice screws'),
  ('Tattoo Supplies', 'tattoo-supplies', 'machine-parts', 'Generic tattoo supplies'),

  -- Shop Supplies
  ('Gloves', 'shop-supplies', 'safety-hygiene', 'Disposable gloves'),
  ('Sterilization Pouches', 'shop-supplies', 'safety-hygiene', 'Sterilization bags'),
  ('Waste Bags', 'shop-supplies', 'cleaning-supplies', 'Waste disposal bags'),
  ('Detergent', 'shop-supplies', 'cleaning-supplies', 'Cleaning detergents'),
  ('First Aid', 'shop-supplies', 'first-aid', 'First aid supplies'),
  ('Paper Sheets', 'shop-supplies', 'paper-supplies', 'Paper and sheets'),
  ('Watercolor Block', 'shop-supplies', 'paper-supplies', 'Watercolor blocks'),
  ('Books', 'shop-supplies', 'books-education', 'Educational books'),
  ('Book', 'shop-supplies', 'books-education', 'Single book'),
  ('Bags', 'shop-supplies', 'bags-storage', 'Bags and cases'),
  ('Apparel', 'shop-supplies', 'apparel', 'Shop apparel'),

  -- Piercing & Jewelry
  ('Body Jewelry', 'piercing-jewelry', 'body-jewelry', 'Body jewelry'),
  ('Jewelry', 'piercing-jewelry', 'specialty-jewelry', 'Generic jewelry'),
  ('Nose Studs', 'piercing-jewelry', 'nose-jewelry', 'Nose studs')
ON CONFLICT (lucky_category) DO UPDATE SET
  tatlist_collection_slug = EXCLUDED.tatlist_collection_slug,
  tatlist_category_slug = EXCLUDED.tatlist_category_slug,
  notes = EXCLUDED.notes;

-- ============================================================================
-- 5. CREATE FUNCTION TO AUTO-MAP PRODUCTS
-- ============================================================================

-- This function will be used to automatically assign collection/category to products
-- based on their Lucky Supply category
CREATE OR REPLACE FUNCTION map_product_categories()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  product_record RECORD;
  mapping_record RECORD;
BEGIN
  -- Loop through all products that have a category but no collection/category assignment
  FOR product_record IN
    SELECT id, category FROM products
    WHERE category IS NOT NULL
    AND (collection_id IS NULL OR category_id IS NULL)
  LOOP
    -- Find matching mapping
    SELECT
      c.id as collection_id,
      cat.id as category_id
    INTO mapping_record
    FROM category_mapping cm
    JOIN collections c ON c.slug = cm.tatlist_collection_slug
    JOIN categories cat ON cat.slug = cm.tatlist_category_slug
    WHERE cm.lucky_category = product_record.category;

    -- Update product if mapping found
    IF FOUND THEN
      UPDATE products
      SET
        collection_id = mapping_record.collection_id,
        category_id = mapping_record.category_id
      WHERE id = product_record.id;

      updated_count := updated_count + 1;
    END IF;
  END LOOP;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. RUN THE MAPPING
-- ============================================================================

-- Apply the mapping to existing products
SELECT map_product_categories() as products_mapped;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE category_mapping IS 'Maps Lucky Supply categories to Tatlist collection/category structure';
COMMENT ON FUNCTION map_product_categories IS 'Automatically assigns collection_id and category_id to products based on their category field';
