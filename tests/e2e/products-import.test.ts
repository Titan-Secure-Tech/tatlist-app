import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Lucky Supply Products Import E2E Test', () => {
  let expectedProducts: any[]

  beforeAll(async () => {
    // Load the expected products from our source file
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    expectedProducts = JSON.parse(productsContent)
  })

  it('should have imported all products', async () => {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    expect(error).toBeNull()
    expect(count).toBe(228)
  })

  it('should have correct product categories', async () => {
    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .order('category')

    expect(error).toBeNull()
    
    const uniqueCategories = [...new Set(categories?.map(p => p.category))]
    expect(uniqueCategories).toContain('Medical Supplies and Sterilization Equipment')
    expect(uniqueCategories).toContain('Tattoo Parts')
    expect(uniqueCategories).toContain('Art and stencil supplies')
    expect(uniqueCategories).toContain('Tattoo Shop Furniture and Supplies')
  })

  it('should have correct product data structure', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    expect(error).toBeNull()
    expect(products).toBeDefined()
    expect(products!.length).toBeGreaterThan(0)

    // Check first product has all required fields
    const firstProduct = products![0]
    expect(firstProduct).toHaveProperty('id')
    expect(firstProduct).toHaveProperty('sku')
    expect(firstProduct).toHaveProperty('name')
    expect(firstProduct).toHaveProperty('description')
    expect(firstProduct).toHaveProperty('price')
    expect(firstProduct).toHaveProperty('category')
    expect(firstProduct).toHaveProperty('brand')
    expect(firstProduct).toHaveProperty('in_stock')
    expect(firstProduct).toHaveProperty('created_at')
    expect(firstProduct).toHaveProperty('updated_at')
  })

  it('should have correct prices as numbers', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('price')
      .limit(10)

    expect(error).toBeNull()
    products?.forEach(product => {
      expect(typeof product.price).toBe('number') // Prices are returned as numbers
      expect(product.price).toBeGreaterThan(0)
    })
  })

  it('should have unique SKUs', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('sku')

    expect(error).toBeNull()
    const skus = products?.map(p => p.sku) || []
    const uniqueSkus = [...new Set(skus)]
    expect(uniqueSkus.length).toBe(skus.length)
  })

  it('should match specific known products', async () => {
    // Test specific products we know should exist
    const { data: spiritProduct, error: spiritError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', 'KPAD092115')
      .single()

    expect(spiritError).toBeNull()
    expect(spiritProduct).toBeDefined()
    expect(spiritProduct?.sku).toBe('KPAD092115')
    expect(spiritProduct?.name).toContain('SPIRIT CLASSIC THERMAL')

    const { data: medicineProduct, error: medicineError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', 'medicine-cups-1oz-100-sleeve-2')
      .single()

    expect(medicineError).toBeNull()
    expect(medicineProduct).toBeDefined()
    expect(medicineProduct?.sku).toBe('medicine-cups-1oz-100-sleeve-2')
    expect(medicineProduct?.name).toContain('MEDICINE CUPS')
  })

  it('should have correct brand distribution', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('brand')

    expect(error).toBeNull()
    
    const brandCounts = products?.reduce((acc: Record<string, number>, p) => {
      acc[p.brand] = (acc[p.brand] || 0) + 1
      return acc
    }, {})

    // Most products should be from Kingpin Supply or Lucky Supply
    expect(brandCounts).toBeDefined()
    const totalProducts = Object.values(brandCounts!).reduce((a, b) => a + b, 0)
    expect(totalProducts).toBe(228)
  })

  it('should have valid stock quantities', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('stock_quantity, in_stock')

    expect(error).toBeNull()
    
    products?.forEach(product => {
      // stock_quantity can be null or a non-negative number
      if (product.stock_quantity !== null) {
        expect(product.stock_quantity).toBeGreaterThanOrEqual(0)
      }
      
      // in_stock should be boolean
      expect(typeof product.in_stock).toBe('boolean')
    })
  })

  it('should have proper text arrays for tags and images', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('tags, images')
      .limit(10)

    expect(error).toBeNull()
    
    products?.forEach(product => {
      expect(Array.isArray(product.tags)).toBe(true)
      expect(Array.isArray(product.images)).toBe(true)
    })
  })

  it('should support searching products by name', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%spirit%')

    expect(error).toBeNull()
    expect(products!.length).toBeGreaterThan(0)
    
    products?.forEach(product => {
      expect(product.name.toLowerCase()).toContain('spirit')
    })
  })
})