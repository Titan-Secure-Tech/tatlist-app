import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface ShopifyProduct {
  Handle: string
  Title: string
  'Body (HTML)': string
  Vendor: string
  Type: string
  Tags: string
  Published: string
  'Option1 Name': string
  'Option1 Value': string
  'Option2 Name': string
  'Option2 Value': string
  'Option3 Name': string
  'Option3 Value': string
  'Variant SKU': string
  'Variant Grams': string
  'Variant Inventory Tracker': string
  'Variant Inventory Qty': string
  'Variant Inventory Policy': string
  'Variant Fulfillment Service': string
  'Variant Price': string
  'Variant Compare At Price': string
  'Variant Requires Shipping': string
  'Variant Taxable': string
  'Variant Barcode': string
  'Image Src': string
  'Image Position': string
  'Image Alt Text': string
  'Gift Card': string
  'SEO Title': string
  'SEO Description': string
  Status: string
  [key: string]: string
}

interface SupabaseProduct {
  sku: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  brand: string
  in_stock: boolean
  stock_quantity: number | null
  tags: string[]
}

async function convertCSVToSupabase() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'assets', 'shopify_formatted_products_cleaned.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    
    // Parse CSV
    const records: ShopifyProduct[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`Found ${records.length} products in CSV`)
    
    // Convert to Supabase format
    const supabaseProducts: SupabaseProduct[] = records
      .filter(record => record.Status === 'active' && record.Handle) // Only active products with handles
      .map((record, index) => {
        // Parse price (remove dollar sign if present)
        const price = parseFloat(record['Variant Price'] || '0')
        
        // Parse stock quantity
        const stockQty = record['Variant Inventory Qty'] ? 
          parseInt(record['Variant Inventory Qty']) : null
        
        // Parse tags
        const tags = record.Tags ? 
          record.Tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        
        // Create images array
        const images = record['Image Src'] ? 
          [record['Image Src']] : []
        
        // Generate SKU if not present
        const sku = record['Variant SKU'] || `${record.Handle}-${index}`
        
        // Clean HTML from description
        const description = record['Body (HTML)']
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\n\n+/g, '\n') // Remove extra newlines
          .trim()
        
        return {
          sku,
          name: record.Title,
          description,
          price,
          images,
          category: record.Type || 'Uncategorized',
          brand: record.Vendor === 'Kingpin Supply' ? 'Lucky Supply' : (record.Vendor || 'Lucky Supply'),
          in_stock: record.Published === 'TRUE' && (stockQty === null || stockQty > 0),
          stock_quantity: stockQty,
          tags
        }
      })
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    
    // Save the converted data
    const outputPath = path.join(dataDir, 'lucky-products-supabase.json')
    await fs.writeFile(
      outputPath,
      JSON.stringify(supabaseProducts, null, 2)
    )
    
    console.log(`\n✅ Conversion complete!`)
    console.log(`📁 Saved ${supabaseProducts.length} products to: ${outputPath}`)
    
    // Show sample of converted data
    console.log('\nSample of converted products:')
    console.log(JSON.stringify(supabaseProducts.slice(0, 3), null, 2))
    
    // Show category breakdown
    const categories = new Map<string, number>()
    supabaseProducts.forEach(product => {
      const count = categories.get(product.category) || 0
      categories.set(product.category, count + 1)
    })
    
    console.log('\nCategory breakdown:')
    categories.forEach((count, category) => {
      console.log(`  ${category}: ${count} products`)
    })
    
  } catch (error) {
    console.error('Conversion failed:', error)
    process.exit(1)
  }
}

// Run the conversion
convertCSVToSupabase().catch(console.error)