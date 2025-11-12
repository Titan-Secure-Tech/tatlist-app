# Migration Steps - Relational Product Schema

## Quick Start Checklist

Follow these steps in order to complete the migration from flat product structure to relational schema.

### ✅ Step 1: Review Documentation

Read through the following files to understand the changes:

- [ ] `RELATIONAL_SCHEMA_SUMMARY.md` - High-level overview of changes
- [ ] `MIGRATION_GUIDE.md` - Detailed migration instructions
- [ ] `src/db/schema.ts` - TypeScript type definitions

### ⚠️ Step 2: Apply Database Migration

**Important:** This step modifies your database. Make sure you have a backup or are using a development/staging environment first.

**Method A: Supabase Dashboard (Recommended)**

1. [ ] Go to https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/sql/new
2. [ ] Open `supabase/migrations/20251111000000_relational_product_schema.sql`
3. [ ] Copy entire file contents
4. [ ] Paste into SQL Editor
5. [ ] Click "Run" to execute migration
6. [ ] Verify success (should see "Success. No rows returned")

**Method B: CLI (If you have Supabase CLI configured)**

```bash
bunx supabase link --project-ref yzpiadsnllrycdfxlneb
bunx supabase db push --include-all
```

### ⚠️ Step 3: Verify Migration Success

Run these SQL queries in Supabase SQL Editor to confirm tables were created:

```sql
-- Check new tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('vendors', 'collections', 'categories', 'subcategories', 'tags', 'product_tags');

-- Should return 6 rows

-- Check view was created
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'products_with_relationships';

-- Should return 1 row

-- Check new columns on products table
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('vendor_id', 'collection_id', 'category_id', 'subcategory_id', 'shopify_product_id');

-- Should return 5 rows
```

### 📦 Step 4: Import Products

Make sure you have the product data files:

- [ ] `public/assets/firecrawl-products.json` - Lucky Supply products ✅ (should already exist)
- [ ] `public/assets/kingpin-products.json` - Kingpin products (optional)

Run the import script:

```bash
bun run import:relational
```

**Expected Output:**

```
🚀 Starting relational product import...

📦 Importing Lucky Supply products...
Found 128 Lucky Supply products
  ✓ Imported 10/128 products...
  ✓ Imported 20/128 products...
  ...
  ✓ Imported 128/128 products...

✅ Lucky Supply import complete: 128 imported, 0 failed

📦 Importing Kingpin products...
⚠️  No Kingpin data found, skipping...

✅ All imports complete!

Summary:
  Vendors: 5
  Collections: 6
  Categories: 15
  Tags: 45
```

### ✅ Step 5: Verify Import Success

Run these SQL queries to check the import:

```sql
-- Check vendors were created
SELECT * FROM vendors;

-- Check collections
SELECT * FROM collections;

-- Check categories with collections
SELECT c.name as category, col.name as collection
FROM categories c
LEFT JOIN collections col ON c.collection_id = col.id
LIMIT 10;

-- Check products with relationships
SELECT name, vendor_name, collection_name, category_name
FROM products_with_relationships
LIMIT 10;

-- Count products by collection
SELECT col.name, COUNT(p.id) as product_count
FROM collections col
LEFT JOIN products p ON p.collection_id = col.id
GROUP BY col.id, col.name
ORDER BY product_count DESC;
```

### 🌐 Step 6: Test Frontend Routes

1. [ ] Start development server: `bun dev`
2. [ ] Visit http://localhost:7500/shop
3. [ ] Verify you see collections (should show collection cards)
4. [ ] Click a collection to see categories
5. [ ] Click a category to see products
6. [ ] Click a product to see product details

**Expected URL Pattern:**

- Collections: `/shop`
- Categories: `/shop/tattoo-equipment-supplies`
- Products: `/shop/tattoo-equipment-supplies/tattoo-ink`
- Product Detail: `/shop/tattoo-equipment-supplies/tattoo-ink/solid-ink-black-1oz`

### 🧪 Step 7: Test API Routes

Test the new API endpoints:

```bash
# Test collections API
curl http://localhost:7500/api/collections | jq

# Test categories API
curl http://localhost:7500/api/categories | jq

# Test products API
curl http://localhost:7500/api/products?limit=5 | jq

# Test products by category
curl "http://localhost:7500/api/products?category_id=<some-category-id>&in_stock=true" | jq
```

### 🎨 Step 8: Update Navigation (Optional but Recommended)

Create a navigation component that shows collections and categories:

```typescript
// components/navigation/shop-nav.tsx
// TODO: Create this component to show:
// - Collections dropdown
// - Categories within selected collection
// - Link to /shop for browsing
```

### 🔍 Step 9: Implement Search (Optional)

Utilize the full-text search capabilities:

```typescript
// Example search query
const { data } = await supabase
  .from('products_with_relationships')
  .select('*')
  .textSearch('search_vector', 'tattoo ink')
```

## Troubleshooting

### Migration fails with "relation already exists"

This is normal if re-running. The migration uses `CREATE TABLE IF NOT EXISTS` to be idempotent.

### No products showing after import

Check:

1. Migration completed successfully (Step 3)
2. Import script found the JSON files (Step 4)
3. Products were linked to collections (Step 5)

Run this to debug:

```sql
SELECT COUNT(*) FROM products WHERE collection_id IS NULL;
-- If this returns > 0, products weren't linked properly
```

### Development server won't start

Check for TypeScript errors:

```bash
bun run type-check
```

### API routes return 404

Make sure the dev server is running and using the correct port (7500):

```bash
bun dev
```

## Rollback Plan

If you need to rollback the migration, see the "Rollback" section in `MIGRATION_GUIDE.md`.

## Success Criteria

Migration is complete when:

- ✅ All 6 new tables exist in database
- ✅ `products_with_relationships` view exists
- ✅ Products imported with vendor/collection/category relationships
- ✅ Frontend shows collections → categories → products
- ✅ Product detail pages work
- ✅ API routes return data
- ✅ Add to cart functionality works

## Next Steps After Migration

1. **SEO**: Add metadata to collection/category/product pages
2. **Filtering**: Add filters for vendor, price, tags
3. **Search**: Build search UI with autocomplete
4. **Admin**: Create admin interface for managing products
5. **Analytics**: Track which collections/categories are popular
6. **Performance**: Implement caching for collection/category listings

## Support

If you encounter issues:

1. Check Supabase logs: https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/logs
2. Verify environment variables in `.env.local`
3. Review TypeScript errors: `bun run type-check`
