# Relational Product Schema Migration Guide

This guide will help you migrate your product database to the new relational schema that supports both Lucky Supply and Kingpin products.

## Overview

The new schema introduces:

- **Vendors** - Product brands (Lucky Supply, Kingpin, Solid Ink, etc.)
- **Collections** - Top-level categories (e.g., "Tattoo Equipment & Supplies")
- **Categories** - Second-tier categories (e.g., "Tattoo Ink", "Power Supplies")
- **Subcategories** - Third-tier categories (e.g., "Black Ink", "1oz Bottles")
- **Tags** - Flexible product tagging system
- **Product Relationships** - Proper foreign keys linking products to vendors, collections, categories, etc.

## Step 1: Apply the Migration

### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your project (if not already linked)
bunx supabase link --project-ref yzpiadsnllrycdfxlneb

# Apply the migration
bunx supabase db push --include-all
```

### Option B: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/sql/new
2. Copy the contents of `supabase/migrations/20251111000000_relational_product_schema.sql`
3. Paste and execute the SQL in the SQL Editor
4. Verify that all tables were created successfully

### Option C: Using psql

```bash
# Get your database URL from Supabase Dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
  -f supabase/migrations/20251111000000_relational_product_schema.sql
```

## Step 2: Import Products

Once the migration is applied, import products from Lucky Supply and Kingpin:

```bash
# Make the import script executable
chmod +x scripts/import-products-relational.ts

# Run the import script
bun run scripts/import-products-relational.ts
```

This script will:

1. Read Lucky Supply products from `public/assets/firecrawl-products.json`
2. Read Kingpin products from `public/assets/kingpin-products.json` (if available)
3. Automatically create/link vendors, collections, categories, and tags
4. Import all products with proper relationships

## Step 3: Verify the Migration

### Check Database Tables

Run this SQL in Supabase SQL Editor to verify:

```sql
-- Check vendors
SELECT * FROM vendors LIMIT 10;

-- Check collections
SELECT * FROM collections LIMIT 10;

-- Check categories with collections
SELECT c.name as category, col.name as collection
FROM categories c
LEFT JOIN collections col ON c.collection_id = col.id
LIMIT 10;

-- Check products with relationships
SELECT * FROM products_with_relationships LIMIT 10;
```

### Test the Frontend

1. Start the development server:

   ```bash
   bun dev
   ```

2. Navigate to http://localhost:7500/shop

3. You should see:
   - Collections page at `/shop`
   - Categories at `/shop/[collection]`
   - Products at `/shop/[collection]/[category]`
   - Product details at `/shop/[collection]/[category]/[product]`

## New URL Structure

The shop now uses a hierarchical URL structure:

- **Collections**: `/shop/tattoo-equipment-supplies`
- **Categories**: `/shop/tattoo-equipment-supplies/tattoo-ink`
- **Products**: `/shop/tattoo-equipment-supplies/tattoo-ink/solid-ink-black-lining-1oz`

## API Endpoints

New API routes are available:

- `GET /api/collections` - List all collections
- `GET /api/collections/[slug]` - Get specific collection
- `GET /api/categories?collection_id=[id]` - List categories (optionally filtered by collection)
- `GET /api/categories/[slug]` - Get specific category
- `GET /api/products?category_id=[id]&in_stock=true` - List products with filters
- `GET /api/products/[sku]` - Get specific product by SKU

## Database Schema Reference

### Tables Created

1. **vendors** - Product vendors/brands
2. **collections** - Top-level categorization
3. **categories** - Second-tier categorization
4. **subcategories** - Third-tier categorization
5. **tags** - Flexible tagging
6. **product_tags** - Many-to-many product-tag junction

### Products Table Updates

New columns added to `products` table:

- `vendor_id` - Foreign key to vendors
- `collection_id` - Foreign key to collections
- `category_id` - Foreign key to categories
- `subcategory_id` - Foreign key to subcategories
- `shopify_product_id` - Original Shopify product ID
- `shopify_handle` - Shopify product handle
- `shopify_type` - Shopify product type
- `shopify_collections` - Array of Shopify collection IDs
- `inventory_management` - Inventory tracking method
- `inventory_policy` - Stock policy (deny/continue)
- `compare_at_price` - Original/compare-at price

### Views Created

**products_with_relationships** - Denormalized view joining products with all related entities for efficient querying

## Troubleshooting

### Migration fails with "relation already exists"

This is normal if you're re-running the migration. The `CREATE TABLE IF NOT EXISTS` clauses will skip existing tables.

### No products showing after import

Check that:

1. The migration completed successfully
2. The import script found the product JSON files
3. Products have been linked to collections/categories

Run this SQL to debug:

```sql
-- Count products by collection
SELECT col.name, COUNT(p.id) as product_count
FROM collections col
LEFT JOIN products p ON p.collection_id = col.id
GROUP BY col.id, col.name;

-- Check for products without categories
SELECT COUNT(*) FROM products WHERE category_id IS NULL;
```

### Import script errors

Make sure you have the required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Next Steps

After completing the migration:

1. **Update Navigation** - Add navigation menus for collections and categories
2. **Add Filters** - Implement filtering by vendor, price, tags, etc.
3. **Search** - Utilize the full-text search capabilities
4. **Admin Interface** - Create admin pages for managing products, categories, etc.

## Rollback (if needed)

To rollback the migration:

```sql
-- Drop new tables (this will cascade and remove foreign keys)
DROP TABLE IF EXISTS product_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Remove new columns from products table
ALTER TABLE products
  DROP COLUMN IF EXISTS vendor_id,
  DROP COLUMN IF EXISTS collection_id,
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS subcategory_id,
  DROP COLUMN IF EXISTS shopify_product_id,
  DROP COLUMN IF EXISTS shopify_handle,
  DROP COLUMN IF EXISTS shopify_type,
  DROP COLUMN IF EXISTS shopify_collections,
  DROP COLUMN IF EXISTS inventory_management,
  DROP COLUMN IF EXISTS inventory_policy,
  DROP COLUMN IF EXISTS compare_at_price,
  DROP COLUMN IF EXISTS search_vector;

-- Drop view
DROP VIEW IF EXISTS products_with_relationships;
```

## Support

If you encounter issues:

1. Check the Supabase logs at https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/logs
2. Verify environment variables are set correctly
3. Check that the database user has sufficient permissions
