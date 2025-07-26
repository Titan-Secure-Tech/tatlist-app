import fs from 'fs/promises'
import path from 'path'

const LUCKY_API_BASE = 'https://luckysupplyapps.com/product_api/getProduct.php'

interface LuckySupplyProduct {
  title: string
  description: string
  images: {
    nodes: Array<{
      altText: string
      src: string
    }>
  }
  variants: Array<{
    title: string
    availableForSale: boolean
    barcode: string
    price: string
  }>
}

interface ProcessedProduct {
  id: string
  handle: string
  title: string
  description: string
  images: string[]
  variants: Array<{
    title: string
    sku: string
    price: number
    available: boolean
  }>
  brand: string
  category: string
  inStock: boolean
  minPrice: number
  maxPrice: number
}

async function fetchProductFromAPI(productId: string): Promise<LuckySupplyProduct | null> {
  try {
    const url = `${LUCKY_API_BASE}?product_id=${productId}`
    console.log(`Fetching: ${productId}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch ${productId}: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${productId}:`, error)
    return null
  }
}

async function processProduct(productId: string, rawData: LuckySupplyProduct): ProcessedProduct {
  const variants = rawData.variants || []
  const prices = variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0)
  
  return {
    id: productId,
    handle: productId,
    title: rawData.title || '',
    description: rawData.description || '',
    images: rawData.images?.nodes?.map(img => img.src) || [],
    variants: variants.map(v => ({
      title: v.title,
      sku: v.barcode || `${productId}-${v.title.replace(/\s+/g, '-').toLowerCase()}`,
      price: parseFloat(v.price) || 0,
      available: v.availableForSale
    })),
    brand: 'Lucky Supply',
    category: 'Tattoo Supplies',
    inStock: variants.some(v => v.availableForSale),
    minPrice: Math.min(...prices) || 0,
    maxPrice: Math.max(...prices) || 0
  }
}

async function fetchAllLuckyProducts() {
  try {
    // Load product IDs
    const idsPath = path.join(process.cwd(), 'data', 'lucky-product-ids.json')
    const idsContent = await fs.readFile(idsPath, 'utf-8')
    const productIds: string[] = JSON.parse(idsContent)
    
    console.log(`Found ${productIds.length} product IDs to fetch`)
    
    const allProducts: ProcessedProduct[] = []
    const failedIds: string[] = []
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10
    const delayBetweenBatches = 2000 // 2 seconds
    
    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize)
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(productIds.length / batchSize)}`)
      
      const batchPromises = batch.map(async (productId) => {
        const rawData = await fetchProductFromAPI(productId)
        if (rawData) {
          const processed = await processProduct(productId, rawData)
          return { success: true, data: processed }
        } else {
          return { success: false, id: productId }
        }
      })
      
      const results = await Promise.all(batchPromises)
      
      results.forEach(result => {
        if (result.success && result.data) {
          allProducts.push(result.data)
          console.log(`✓ ${result.data.title}`)
        } else if (!result.success && result.id) {
          failedIds.push(result.id)
          console.log(`✗ Failed: ${result.id}`)
        }
      })
      
      // Delay between batches
      if (i + batchSize < productIds.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }
    
    // Save the complete product data
    const outputDir = path.join(process.cwd(), 'data')
    await fs.mkdir(outputDir, { recursive: true })
    
    // Save full product data
    const productsPath = path.join(outputDir, 'lucky-products-complete.json')
    await fs.writeFile(productsPath, JSON.stringify(allProducts, null, 2))
    console.log(`\nSaved ${allProducts.length} products to ${productsPath}`)
    
    // Save failed IDs for retry
    if (failedIds.length > 0) {
      const failedPath = path.join(outputDir, 'lucky-failed-ids.json')
      await fs.writeFile(failedPath, JSON.stringify(failedIds, null, 2))
      console.log(`Saved ${failedIds.length} failed IDs to ${failedPath}`)
    }
    
    // Create import-ready format for Supabase
    const supabaseProducts = allProducts.flatMap(product => {
      // Create a product entry for each variant
      return product.variants.map(variant => ({
        sku: variant.sku,
        name: variant.title !== 'Default Title' 
          ? `${product.title} - ${variant.title}`
          : product.title,
        description: product.description,
        price: variant.price,
        images: product.images,
        category: product.category,
        brand: product.brand,
        in_stock: variant.available,
        stock_quantity: variant.available ? 100 : 0,
        tags: [],
        lucky_product_id: product.id,
        lucky_variant_title: variant.title
      }))
    })
    
    const supabasePath = path.join(outputDir, 'lucky-products-supabase.json')
    await fs.writeFile(supabasePath, JSON.stringify(supabaseProducts, null, 2))
    console.log(`Created Supabase import file with ${supabaseProducts.length} product variants`)
    
    // Create summary CSV
    const csvContent = [
      'id,title,variants,min_price,max_price,in_stock,images',
      ...allProducts.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.variants.length,
        p.minPrice,
        p.maxPrice,
        p.inStock,
        p.images.length
      ].join(','))
    ].join('\n')
    
    const csvPath = path.join(outputDir, 'lucky-products-summary.csv')
    await fs.writeFile(csvPath, csvContent)
    console.log(`Created summary CSV at ${csvPath}`)
    
    console.log('\n=== Summary ===')
    console.log(`Total products fetched: ${allProducts.length}`)
    console.log(`Total variants: ${supabaseProducts.length}`)
    console.log(`Failed to fetch: ${failedIds.length}`)
    console.log('\nNext step: Import the data to Supabase using the admin panel')
    
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

// Run the fetcher
fetchAllLuckyProducts().catch(console.error)