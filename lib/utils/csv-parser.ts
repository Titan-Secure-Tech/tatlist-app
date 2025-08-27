import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import { Product } from '@/types'

export interface CSVProduct {
  Handle: string
  Title: string
  'Body (HTML)'?: string
  Vendor?: string
  Type?: string
  Tags?: string
  'Variant SKU'?: string
  'Variant Price'?: string | number
  'Variant Inventory Qty'?: string | number
  'Image Src'?: string
  Status?: string
}

export function parseProductsCSV(filePath: string): CSVProduct[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVProduct[]
  
  return records
}

export function transformCSVToProduct(csvProduct: CSVProduct): Omit<Product, 'id'> {
  const price = csvProduct['Variant Price'] 
    ? (typeof csvProduct['Variant Price'] === 'string' 
      ? parseFloat(csvProduct['Variant Price'].replace('$', '').replace(',', '')) 
      : csvProduct['Variant Price'])
    : 0
    
  const stockQty = csvProduct['Variant Inventory Qty']
    ? parseInt(csvProduct['Variant Inventory Qty'].toString())
    : 0
    
  return {
    sku: csvProduct['Variant SKU'] || csvProduct.Handle || '',
    name: csvProduct.Title || '',
    description: csvProduct['Body (HTML)'] || '',
    price: price,
    images: csvProduct['Image Src'] ? [csvProduct['Image Src']] : [],
    category: csvProduct.Type || 'Uncategorized',
    brand: csvProduct.Vendor === 'Kingpin Supply' ? 'Lucky Supply' : (csvProduct.Vendor || 'Lucky Supply'),
    in_stock: csvProduct.Status === 'active' && stockQty > 0,
    stock_quantity: stockQty,
    tags: csvProduct.Tags ? csvProduct.Tags.split(',').map(tag => tag.trim()) : []
  }
}

export function loadProductsFromCSV(): Omit<Product, 'id'>[] {
  const csvPath = path.join(process.cwd(), 'public', 'assets', 'shopify_formatted_products_cleaned.csv')
  const csvProducts = parseProductsCSV(csvPath)
  return csvProducts.map(transformCSVToProduct)
}