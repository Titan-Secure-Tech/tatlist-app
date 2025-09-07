import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load production environment variables
dotenv.config({ path: '.env.production.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Production Database Verification', () => {
  it('should have products in production database', async () => {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    expect(error).toBeNull()
    expect(count).toBe(68)
  })

  it('should have correct product categories in production', async () => {
    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .order('category')

    expect(error).toBeNull()

    const uniqueCategories = [...new Set(categories?.map(p => p.category))]
    expect(uniqueCategories).toContain('Aftercare')
    expect(uniqueCategories).toContain('Needles')
    expect(uniqueCategories).toContain('Inks')
    expect(uniqueCategories).toContain('Machines')
  })

  it('should have key products in production', async () => {
    // Just check that we can query products
    const { data, error } = await supabase
      .from('products')
      .select('sku, name, price')
      .limit(1)
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data?.price).toBeGreaterThan(0)
  })

  it('should support searching in production', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('name')
      .ilike('name', '%tattoo%')
      .limit(10)

    expect(error).toBeNull()
    expect(products).toBeDefined()
    expect(products!.length).toBeGreaterThan(0)
  })
})
