#!/usr/bin/env bun

import puppeteer from 'puppeteer'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Product name mappings for better search results
const productMappings: Record<string, string> = {
  'SPIRIT CLASSIC THERMAL': 'spirit thermal paper',
  'SPIRIT GREEN': 'spirit green',
  'SPIRIT VEGAN': 'spirit vegan',
  'STENCILSTUFF': 'stencil stuff',
  'SPRAY STUFF': 'spray stuff',
  'PREP STUFF': 'prep stuff',
  'OPTI-CIDE': 'opticide',
  'INK CAPS': 'ink cap',
  'BARRIER FILM': 'barrier film',
  'LAP CLOTHS': 'lap cloth',
  'CLIP CORD': 'clip cord',
  'DRAPE SHEETS': 'drape sheet',
}

// Function to get search term
function getSearchTerm(productName: string): string {
  // Check if we have a mapping
  for (const [key, value] of Object.entries(productMappings)) {
    if (productName.toUpperCase().includes(key)) {
      return value
    }
  }
  
  // Otherwise, clean up the product name
  return productName
    .replace(/[•™®]/g, '') // Remove special characters
    .replace(/\d+['"]\s*x\s*\d+['"]/g, '') // Remove dimensions
    .replace(/\d+\/\w+/g, '') // Remove quantities like "100/box"
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .split(' ')
    .slice(0, 3) // Take first 3 words
    .join(' ')
}

// Function to search and get product info
async function searchProduct(browser: any, productName: string, sku: string) {
  const page = await browser.newPage()
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    // Get search term
    const searchTerm = getSearchTerm(productName)
    console.log(`  🔍 Searching for: "${searchTerm}"`)
    
    // Try search
    const searchUrl = `https://www.luckysupply.com/search?q=${encodeURIComponent(searchTerm)}`
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if we have search results
    const hasResults = await page.evaluate(() => {
      // Look for various product containers
      const selectors = [
        '.product-grid-item',
        '.grid__item',
        '.product-item',
        '[data-product-grid-item]',
        '.collection__products .grid__item',
        '.search__results .grid__item'
      ]
      
      for (const selector of selectors) {
        if (document.querySelector(selector)) return true
      }
      return false
    })
    
    if (!hasResults) {
      console.log(`  ❌ No search results`)
      return null
    }
    
    // Extract product data from search results
    const productData = await page.evaluate((targetName: string) => {
      // Try multiple selectors
      const products = document.querySelectorAll('.grid__item, .product-grid-item, [data-product-grid-item]')
      
      for (const product of Array.from(products).slice(0, 5)) { // Check first 5 results
        const titleEl = product.querySelector('h3, h2, .product-item__title, [class*="title"]')
        const title = titleEl?.textContent?.trim() || ''
        
        // Check if title matches
        if (title.toLowerCase().includes(targetName.toLowerCase().split(' ')[0])) {
          const link = product.querySelector('a')?.href
          const imgEl = product.querySelector('img')
          const img = imgEl?.src || imgEl?.getAttribute('data-src')
          
          if (link && img) {
            return { title, link, img }
          }
        }
      }
      
      // If no match, return the first product
      const firstProduct = products[0]
      if (firstProduct) {
        const link = firstProduct.querySelector('a')?.href
        const imgEl = firstProduct.querySelector('img')
        const img = imgEl?.src || imgEl?.getAttribute('data-src')
        const title = firstProduct.querySelector('h3, h2, .product-item__title, [class*="title"]')?.textContent?.trim()
        
        if (link && img) {
          return { title, link, img }
        }
      }
      
      return null
    }, searchTerm)
    
    return productData
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`)
    return null
  } finally {
    await page.close()
  }
}

// Function to download and upload image
async function processImage(imageUrl: string, sku: string): Promise<string | null> {
  try {
    // Clean up image URL
    let cleanUrl = imageUrl
    if (imageUrl.startsWith('//')) {
      cleanUrl = 'https:' + imageUrl
    }
    
    console.log(`  📥 Downloading image...`)
    const response = await fetch(cleanUrl)
    if (!response.ok) {
      console.log(`  ❌ Failed to download image`)
      return null
    }
    
    const buffer = await response.arrayBuffer()
    const filename = `${sku}_main.jpg`
    
    console.log(`  📤 Uploading to Supabase...`)
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error(`  ❌ Upload error:`, error.message)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)
    
    console.log(`  ✅ Image uploaded successfully`)
    return publicUrl
  } catch (error) {
    console.error(`  ❌ Error processing image:`, error)
    return null
  }
}

// Main function
async function scrapeLuckyImagesV2() {
  console.log('🚀 Starting Lucky Supply image scraper v2...\n')
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    // Get products without images
    const { data: products, error } = await supabase
      .from('products')
      .select('id, sku, name, images')
      .or('images.is.null,images.eq.{}')
      .limit(10) // Start with just 10 for testing
    
    if (error) {
      console.error('Failed to fetch products:', error)
      return
    }
    
    console.log(`📊 Found ${products.length} products without images\n`)
    
    let successCount = 0
    
    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name} (${product.sku})`)
      
      const productData = await searchProduct(browser, product.name, product.sku)
      
      if (productData && productData.img) {
        console.log(`  ✅ Found: ${productData.title}`)
        
        const uploadedUrl = await processImage(productData.img, product.sku)
        
        if (uploadedUrl) {
          // Update product
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              images: [uploadedUrl],
              source_url: productData.link 
            })
            .eq('id', product.id)
          
          if (!updateError) {
            successCount++
            console.log(`  ✅ Product updated successfully`)
          } else {
            console.error(`  ❌ Failed to update product:`, updateError.message)
          }
        }
      } else {
        console.log(`  ⚠️  No image found`)
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✅ Scraping complete!`)
    console.log(`📊 Successfully updated: ${successCount}/${products.length} products`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  } finally {
    await browser.close()
  }
}

// Run the scraper
scrapeLuckyImagesV2()