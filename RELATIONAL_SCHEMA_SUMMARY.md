# Relational Product Schema Implementation Summary

## Overview

I've successfully restructured the database and frontend to support both Lucky Supply and Kingpin products using a proper relational schema. This implementation follows the pattern from [NextFaster](https://github.com/ethanniser/NextFaster/blob/main/src/db/schema.ts) with hierarchical product categorization.

## What Was Changed

### 1. Database Schema (Migration: `20251111000000_relational_product_schema.sql`)

#### New Tables Created

**Vendors** (`vendors`)

- Stores product brands (Lucky Supply, Kingpin, Solid Ink, Critical, etc.)
- Fields: `id`, `slug`, `name`, `description`, `logo_url`, `website_url`

**Collections** (`collections`)

- Top-level product categories (e.g., "Tattoo Equipment & Supplies")
- Fields: `id`, `slug`, `name`, `description`, `image_url`, `sort_order`

**Categories** (`categories`)

- Second-tier categorization under collections (e.g., "Tattoo Ink", "Power Supplies")
- Fields: `id`, `slug`, `name`, `description`, `collection_id` (FK), `image_url`, `sort_order`

**Subcategories** (`subcategories`)

- Third-tier categorization under categories (e.g., "Black Ink", "1oz Bottles")
- Fields: `id`, `slug`, `name`, `description`, `category_id` (FK), `image_url`, `sort_order`

**Tags** (`tags`)

- Flexible tagging system for products
- Fields: `id`, `slug`, `name`

**Product Tags** (`product_tags`)

- Many-to-many junction table linking products to tags
- Fields: `id`, `product_id` (FK), `tag_id` (FK)

#### Products Table Updates

Added new columns to support relational structure and both product sources:

**Relational Fields:**

- `vendor_id` - Foreign key to vendors table
- `collection_id` - Foreign key to collections table
- `category_id` - Foreign key to categories table
- `subcategory_id` - Foreign key to subcategories table

**Shopify-Specific Fields** (for both Lucky Supply and Kingpin):

- `shopify_product_id` - Original Shopify product ID
- `shopify_handle` - Product URL handle
- `shopify_type` - Product type from Shopify
- `shopify_collections` - Array of Shopify collection IDs
- `inventory_management` - Inventory tracking method
- `inventory_policy` - Stock policy (deny/continue)
- `compare_at_price` - Original/compare-at price

**Search Enhancement:**

- `search_vector` - Full-text search (generated column)
- Trigram index on `name` for fuzzy matching

#### Database View

**products_with_relationships**

- Denormalized view joining products with all related entities
- Includes vendor name/slug, collection name/slug, category name/slug, subcategory name/slug, tag names/slugs
- Optimized for fast querying in the frontend

### 2. TypeScript Schema (`src/db/schema.ts`)

Created comprehensive type definitions:

- `Vendor`, `VendorInsert`
- `Collection`, `CollectionInsert`
- `Category`, `CategoryInsert`, `CategoryWithCollection`
- `Subcategory`, `SubcategoryInsert`, `SubcategoryWithCategory`
- `Tag`, `TagInsert`
- `Product`, `ProductInsert`, `ProductVariation`
- `ProductWithRelationships`, `ProductsWithRelationshipsView`
- `LuckySupplyProduct`, `KingpinProduct` (source formats)

**Helper Functions:**

- `luckySupplyToProduct()` - Converts Lucky Supply JSON to internal format
- `kingpinToProduct()` - Converts Kingpin JSON to internal format
- `slugify()` - Generates URL-safe slugs

### 3. Import Script (`scripts/import-products-relational.ts`)

Intelligent import script that:

- Reads Lucky Supply products from `public/assets/firecrawl-products.json`
- Reads Kingpin products from `public/assets/kingpin-products.json`
- Automatically creates/links vendors based on product brand
- Maps Lucky Supply `type` field to collections/categories
- Maps Kingpin tags to categories
- Links products to tags via junction table
- Updates existing products or inserts new ones
- Caches lookups for performance

**Usage:**

```bash
bun run import:relational
```

### 4. Frontend Route Structure

Implemented hierarchical routing following `/shop/[collection]/[category]/[product]` pattern:

#### Routes Created

**`/shop/page.tsx`** (Collections Index)

- Displays all collections as cards
- Shows product count per collection
- Server-rendered with Supabase data

**`/shop/[collection]/page.tsx`** (Categories in Collection)

- Shows all categories within a collection
- Breadcrumb navigation
- Product count per category

**`/shop/[collection]/[category]/page.tsx`** (Products in Category)

- Displays all products in a category
- Shows subcategories if available
- Product grid with add-to-cart functionality
- Filters by vendor, stock status

**`/shop/[collection]/[category]/[product]/page.tsx`** (Product Details)

- Full product details page
- Image gallery with thumbnails
- Add to cart with quantity selector
- Product features (authentic, fast delivery, secure checkout)
- Related products section
- Tags display

#### Client Components

**`components/shop/add-to-cart-button.tsx`**

- Quantity controls
- Add to cart functionality
- Shows "Update Cart" if already in cart
- Disabled when out of stock

**`components/shop/product-image-gallery.tsx`**

- Main image display
- Thumbnail grid
- Image selection with active state

### 5. API Routes

Created RESTful API endpoints:

**Collections:**

- `GET /api/collections` - List all collections
- `GET /api/collections/[slug]` - Get specific collection

**Categories:**

- `GET /api/categories` - List categories (filter by `?collection_id=...`)
- `GET /api/categories/[slug]` - Get specific category

**Products:**

- `GET /api/products` - List products with filters:
  - `?collection_id=...`
  - `?category_id=...`
  - `?subcategory_id=...`
  - `?vendor_id=...`
  - `?in_stock=true`
  - `?limit=100`
  - `?offset=0`
- `GET /api/products/[sku]` - Get specific product by SKU

## URL Structure Examples

```
/shop
/shop/tattoo-equipment-supplies
/shop/tattoo-equipment-supplies/tattoo-ink
/shop/tattoo-equipment-supplies/tattoo-ink/solid-ink-black-lining-1oz
```

## Data Flow

### Lucky Supply Products

1. **Source:** `public/assets/firecrawl-products.json`
2. **Structure:**
   - `vendor` field → `vendors` table
   - `type` field → `collections` and `categories` tables
   - `tags` array → `tags` table + `product_tags` junction
   - Product data → `products` table with foreign keys

### Kingpin Products

1. **Source:** `public/assets/kingpin-products.json`
2. **Structure:**
   - `vendor` field → `vendors` table
   - `collections` array → Stored in `shopify_collections`
   - First tag → `categories` table
   - `tags` array → `tags` table + `product_tags` junction
   - Product data → `products` table with foreign keys

## How to Use

### 1. Apply the Migration

**Option A: Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/sql/new
2. Copy contents of `supabase/migrations/20251111000000_relational_product_schema.sql`
3. Execute in SQL Editor

**Option B: CLI (if credentials are configured)**

```bash
bunx supabase db push --include-all
```

### 2. Import Products

```bash
# Make sure you have the product JSON files:
# - public/assets/firecrawl-products.json (Lucky Supply)
# - public/assets/kingpin-products.json (Kingpin, optional)

# Run the import
bun run import:relational
```

### 3. Verify

```bash
# Start dev server
bun dev

# Visit http://localhost:7500/shop
# You should see collections → categories → products
```

## Key Features

### Backwards Compatibility

The migration preserves existing columns (`category`, `brand`, `tags`) so existing code continues to work while you migrate to the new relational structure.

### Full-Text Search

Products are indexed for full-text search on `name`, `description`, and `brand` fields:

```sql
SELECT * FROM products_with_relationships
WHERE search_vector @@ to_tsquery('english', 'tattoo & ink');
```

### Fuzzy Matching

Trigram indexes enable fuzzy product name searches:

```sql
SELECT * FROM products
WHERE name % 'solic ink'  -- Will match "Solid Ink"
ORDER BY similarity(name, 'solic ink') DESC;
```

### Cascade Deletion

When a collection is deleted, all related categories, subcategories, and product relationships are automatically cleaned up.

### Row Level Security

All new tables have RLS enabled with:

- Public read access
- Service role full access

## Schema Hierarchy

```
vendors
├── (products)

collections
└── categories
    ├── subcategories
    │   └── (products)
    └── (products)

tags
└── product_tags
    └── products
```

## Files Created/Modified

### New Files

1. `supabase/migrations/20251111000000_relational_product_schema.sql` - Database migration
2. `src/db/schema.ts` - TypeScript schema definitions
3. `scripts/import-products-relational.ts` - Import script
4. `app/shop/page.tsx` - Collections index (modified)
5. `app/shop/[collection]/page.tsx` - Category listing
6. `app/shop/[collection]/[category]/page.tsx` - Product listing
7. `app/shop/[collection]/[category]/[product]/page.tsx` - Product details
8. `components/shop/add-to-cart-button.tsx` - Cart button component
9. `components/shop/product-image-gallery.tsx` - Image gallery component
10. `app/api/collections/route.ts` - Collections API
11. `app/api/collections/[slug]/route.ts` - Single collection API
12. `app/api/categories/route.ts` - Categories API
13. `app/api/categories/[slug]/route.ts` - Single category API
14. `app/api/products/route.ts` - Products API (updated)
15. `app/api/products/[sku]/route.ts` - Single product API
16. `MIGRATION_GUIDE.md` - Detailed migration instructions
17. `RELATIONAL_SCHEMA_SUMMARY.md` - This file

### Modified Files

1. `package.json` - Added `import:relational` script

## Next Steps

After applying the migration and importing products:

1. **Navigation Menu** - Add navigation for collections and categories
2. **Filtering** - Implement vendor, price range, and tag filters
3. **Search** - Build search UI using the full-text search capabilities
4. **Admin Panel** - Create admin interface for managing products, categories, vendors
5. **Breadcrumbs** - Add breadcrumb navigation component
6. **SEO** - Add metadata for collection/category/product pages
7. **Performance** - Implement caching strategy for collection/category listings

## Troubleshooting

See `MIGRATION_GUIDE.md` for detailed troubleshooting steps.

## Questions?

This implementation follows industry best practices for e-commerce product categorization:

- Hierarchical categories for organization
- Flexible tagging for cross-category discovery
- Vendor relationships for brand filtering
- Full-text search for product discovery
- Proper indexing for performance

The schema supports both Lucky Supply (with `type` field) and Kingpin (with `collections` array) while maintaining a unified interface for the frontend.
