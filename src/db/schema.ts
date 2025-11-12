/**
 * Database Schema Definitions
 *
 * This file contains TypeScript types and interfaces for the relational product schema.
 * Supports both Lucky Supply and Kingpin product structures with proper relationships.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// ============================================================================
// VENDOR SCHEMA
// ============================================================================

export interface Vendor extends BaseEntity {
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
}

export interface VendorInsert {
  slug: string
  name: string
  description?: string
  logo_url?: string
  website_url?: string
}

// ============================================================================
// COLLECTION SCHEMA (Top-level category)
// ============================================================================

export interface Collection extends BaseEntity {
  slug: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
}

export interface CollectionInsert {
  slug: string
  name: string
  description?: string
  image_url?: string
  sort_order?: number
}

// ============================================================================
// CATEGORY SCHEMA (Second-tier)
// ============================================================================

export interface Category extends BaseEntity {
  slug: string
  name: string
  description: string | null
  collection_id: string | null
  image_url: string | null
  sort_order: number
}

export interface CategoryInsert {
  slug: string
  name: string
  description?: string
  collection_id?: string
  image_url?: string
  sort_order?: number
}

export interface CategoryWithCollection extends Category {
  collection: Collection | null
}

// ============================================================================
// SUBCATEGORY SCHEMA (Third-tier)
// ============================================================================

export interface Subcategory extends BaseEntity {
  slug: string
  name: string
  description: string | null
  category_id: string | null
  image_url: string | null
  sort_order: number
}

export interface SubcategoryInsert {
  slug: string
  name: string
  description?: string
  category_id?: string
  image_url?: string
  sort_order?: number
}

export interface SubcategoryWithCategory extends Subcategory {
  category: CategoryWithCollection | null
}

// ============================================================================
// TAG SCHEMA
// ============================================================================

export interface Tag {
  id: string
  slug: string
  name: string
  created_at: string
}

export interface TagInsert {
  slug: string
  name: string
}

// ============================================================================
// PRODUCT TAG JUNCTION
// ============================================================================

export interface ProductTag {
  id: string
  product_id: string
  tag_id: string
  created_at: string
}

export interface ProductTagInsert {
  product_id: string
  tag_id: string
}

// ============================================================================
// PRODUCT SCHEMA
// ============================================================================

export interface Product extends BaseEntity {
  // Basic product info
  sku: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null

  // Media
  images: string[]
  attachments: string[] | null

  // Categorization (relational)
  vendor_id: string | null
  collection_id: string | null
  category_id: string | null
  subcategory_id: string | null

  // Legacy categorization (for backwards compatibility)
  category: string | null
  brand: string | null
  tags: string[] | null

  // Inventory
  in_stock: boolean
  stock_quantity: number | null
  inventory_management: string | null
  inventory_policy: string | null

  // Source metadata
  source_url: string | null
  sync_source: string | null

  // Shopify-specific fields (for Kingpin products)
  shopify_product_id: number | null
  shopify_handle: string | null
  shopify_type: string | null
  shopify_collections: number[] | null

  // Square integration
  square_catalog_id: string | null
  square_variation_id: string | null
  square_updated_at: string | null
  variations: ProductVariation[] | null
}

export interface ProductVariation {
  id: string
  name: string
  sku?: string
  price: number
  compare_at_price?: number
  available: boolean
  inventory_quantity?: number
  option1?: string
  option2?: string
  option3?: string
}

export interface ProductInsert {
  sku: string
  name: string
  description?: string
  price: number
  compare_at_price?: number
  images?: string[]
  attachments?: string[]
  vendor_id?: string
  collection_id?: string
  category_id?: string
  subcategory_id?: string
  category?: string
  brand?: string
  tags?: string[]
  in_stock?: boolean
  stock_quantity?: number
  inventory_management?: string
  inventory_policy?: string
  source_url?: string
  sync_source?: string
  shopify_product_id?: number
  shopify_handle?: string
  shopify_type?: string
  shopify_collections?: number[]
  square_catalog_id?: string
  square_variation_id?: string
  variations?: ProductVariation[]
}

// ============================================================================
// JOINED PRODUCT SCHEMA (with all relationships)
// ============================================================================

export interface ProductWithRelationships extends Product {
  vendor: Vendor | null
  collection: Collection | null
  category: CategoryWithCollection | null
  subcategory: SubcategoryWithCategory | null
  product_tags: Array<{
    tag: Tag
  }>
}

// View schema matching the database view
export interface ProductsWithRelationshipsView extends Product {
  vendor_name: string | null
  vendor_slug: string | null
  collection_name: string | null
  collection_slug: string | null
  category_name: string | null
  category_slug: string | null
  subcategory_name: string | null
  subcategory_slug: string | null
  tag_names: string[] | null
  tag_slugs: string[] | null
}

// ============================================================================
// LUCKY SUPPLY PRODUCT SCHEMA (source format)
// ============================================================================

export interface LuckySupplyProduct {
  id: number
  title: string
  handle: string
  description: string
  published_at: string
  created_at: string
  vendor: string
  type: string
  tags: string[]
  price: number
  price_min: number
  price_max: number
  available: boolean
  price_varies: boolean
  compare_at_price: number | null
  compare_at_price_min: number
  compare_at_price_max: number
  compare_at_price_varies: boolean
  variants: Array<{
    id: number
    title: string
    option1: string
    option2: string | null
    option3: string | null
    sku: string
    requires_shipping: boolean
    taxable: boolean
    featured_image: string | null
    available: boolean
    name: string
    public_title: string | null
    options: string[]
    price: number
    weight: number
    compare_at_price: number | null
    inventory_management: string
    barcode: string
    quantity_rule: {
      min: number
      max: number | null
      increment: number
    }
    quantity_price_breaks: unknown[]
    requires_selling_plan: boolean
    selling_plan_allocations: unknown[]
  }>
  images: string[]
  featured_image: string
  options: Array<{
    name: string
    position: number
    values: string[]
  }>
  url: string
  media: Array<{
    alt: string | null
    id: number
    position: number
    preview_image: {
      aspect_ratio: number
      height: number
      width: number
      src: string
    }
    aspect_ratio: number
    height: number
    media_type: string
    src: string
    width: number
  }>
  requires_selling_plan: boolean
  selling_plan_groups: unknown[]
}

// ============================================================================
// KINGPIN PRODUCT SCHEMA (source format)
// ============================================================================

export interface KingpinProduct {
  id: number
  title: string
  vendor: string
  handle: string
  collections: number[]
  tags: string[]
  price: number
  price_min: number
  price_max: number
  compare_at_price_min: number
  compare_at_price_max: number
  available: boolean
  inventory: number
  inventory_management: string
  inventory_policy: string
  publish_at: string
  format_money: string
  variants: Array<{
    id: number
    title: string
    available: boolean
    compare_at_price: number
    image: string
    inventory_management: string
    inventory_policy: string
    price: number
    quantity: number
    vendor: string
  }>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts Lucky Supply product to internal product format
 */
export function luckySupplyToProduct(
  luckyProduct: LuckySupplyProduct,
  vendorId: string,
  collectionId?: string,
  categoryId?: string,
  subcategoryId?: string
): ProductInsert {
  return {
    sku: luckyProduct.variants[0]?.sku || `LS-${luckyProduct.id}`,
    name: luckyProduct.title,
    description: luckyProduct.description,
    price: luckyProduct.price / 100, // Convert cents to dollars
    compare_at_price: luckyProduct.compare_at_price
      ? luckyProduct.compare_at_price / 100
      : undefined,
    images: luckyProduct.images,
    vendor_id: vendorId,
    collection_id: collectionId,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    brand: luckyProduct.vendor,
    category: luckyProduct.type,
    tags: luckyProduct.tags,
    in_stock: luckyProduct.available,
    source_url: `https://luckysupply.com${luckyProduct.url}`,
    sync_source: 'firecrawl',
    shopify_product_id: luckyProduct.id,
    shopify_handle: luckyProduct.handle,
    shopify_type: luckyProduct.type,
    variations: luckyProduct.variants.map(v => ({
      id: v.id.toString(),
      name: v.title,
      sku: v.sku,
      price: v.price / 100,
      compare_at_price: v.compare_at_price ? v.compare_at_price / 100 : undefined,
      available: v.available,
      inventory_quantity: undefined,
      option1: v.option1,
      option2: v.option2 || undefined,
      option3: v.option3 || undefined,
    })),
  }
}

/**
 * Converts Kingpin product to internal product format
 */
export function kingpinToProduct(
  kingpinProduct: KingpinProduct,
  vendorId: string,
  collectionId?: string,
  categoryId?: string,
  subcategoryId?: string
): ProductInsert {
  return {
    sku: kingpinProduct.variants[0]?.id.toString() || `KP-${kingpinProduct.id}`,
    name: kingpinProduct.title,
    description: undefined,
    price: kingpinProduct.price / 100, // Convert cents to dollars
    compare_at_price: kingpinProduct.compare_at_price_min
      ? kingpinProduct.compare_at_price_min / 100
      : undefined,
    images: kingpinProduct.variants[0]?.image ? [kingpinProduct.variants[0].image] : [],
    vendor_id: vendorId,
    collection_id: collectionId,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    brand: kingpinProduct.vendor,
    tags: kingpinProduct.tags,
    in_stock: kingpinProduct.available,
    stock_quantity: kingpinProduct.inventory,
    inventory_management: kingpinProduct.inventory_management,
    inventory_policy: kingpinProduct.inventory_policy,
    sync_source: 'kingpin',
    shopify_product_id: kingpinProduct.id,
    shopify_handle: kingpinProduct.handle,
    shopify_collections: kingpinProduct.collections,
    variations: kingpinProduct.variants.map(v => ({
      id: v.id.toString(),
      name: v.title,
      price: v.price / 100,
      compare_at_price: v.compare_at_price ? v.compare_at_price / 100 : undefined,
      available: v.available,
      inventory_quantity: v.quantity,
    })),
  }
}

/**
 * Generates a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
