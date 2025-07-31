#!/usr/bin/env bun

import puppeteer from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Lucky Supply search URL
const LUCKY_SEARCH_URL = 'https://www.luckysupply.com/search?q='

// Function to search and get product image
async function getProductImage(browser: any, productName: string, sku: string): Promise<{ imageUrl: string | null, productUrl: string | null }> {
  const page = await browser.newPage()
  
  try {
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Search for the product
    const searchQuery = productName.replace(/[^\w\s]/gi, '').trim()
    const searchUrl = `${LUCKY_SEARCH_URL}${encodeURIComponent(searchQuery)}`
    
    console.log(`  🔍 Searching for: ${searchQuery}`)
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Wait for search results
    await page.waitForTimeout(2000)
    
    // Try to find the product in search results
    const productLink = await page.evaluate((targetName: string) => {
      const products = document.querySelectorAll('.product-item, .product-card, [class*="product"]')
      
      for (const product of products) {
        const titleElement = product.querySelector('h3, h4, .product-title, .product-name, [class*="title"]')
        if (titleElement && titleElement.textContent?.toLowerCase().includes(targetName.toLowerCase().substring(0, 20))) {
          const link = product.querySelector('a')
          return link?.href || null
        }
      }
      
      // If no exact match, return the first product
      const firstProduct = products[0]
      const link = firstProduct?.querySelector('a')
      return link?.href || null
    }, productName)
    
    if (!productLink) {
      console.log(`  ❌ No products found for: ${productName}`)
      return { imageUrl: null, productUrl: null }
    }
    
    // Navigate to product page
    console.log(`  📄 Found product page`)
    await page.goto(productLink, { waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Extract main product image
    const imageData = await page.evaluate(() => {
      // Try multiple selectors for product images
      const selectors = [
        '.product-photo-container img',
        '.product-image img',
        '.main-image img',
        '[class*="product-photo"] img',
        '[class*="product-image"] img',
        '.product__media img',
        'img[data-zoom]',
        'img.main-img'
      ]
      
      for (const selector of selectors) {
        const img = document.querySelector(selector) as HTMLImageElement
        if (img && img.src && !img.src.includes('placeholder')) {
          return img.src
        }
      }
      
      // Fallback to any large image
      const allImages = Array.from(document.querySelectorAll('img'))
      const productImage = allImages.find(img => 
        img.width > 200 && 
        img.src && 
        !img.src.includes('logo') && 
        !img.src.includes('icon')
      )
      
      return productImage?.src || null
    })
    
    if (imageData) {
      console.log(`  ✅ Found image`)
      return { imageUrl: imageData, productUrl: productLink }
    } else {
      console.log(`  ⚠️  No image found on product page`)
      return { imageUrl: null, productUrl: productLink }
    }
    
  } catch (error) {
    console.error(`  ❌ Error scraping ${productName}:`, error)
    return { imageUrl: null, productUrl: null }
  } finally {
    await page.close()
  }
}

// Function to download and upload image
async function downloadAndUploadImage(imageUrl: string, sku: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null
    
    const buffer = await response.arrayBuffer()
    const filename = `${sku}_main.jpg`
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error(`Failed to upload image for ${sku}:`, error)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)
    
    return publicUrl
  } catch (error) {
    console.error(`Error processing image for ${sku}:`, error)
    return null
  }
}

// Main function
async function scrapeLuckyImages() {
  console.log('🚀 Starting Lucky Supply image scraper...\n')
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    // Get products from database that need images
    const { data: products, error } = await supabase
      .from('products')
      .select('id, sku, name, images')
      .or('images.is.null,images.eq.{}')
      .limit(50) // Process 50 at a time
    
    if (error) {
      console.error('Failed to fetch products:', error)
      return
    }
    
    console.log(`📊 Found ${products.length} products without images\n`)
    
    let successCount = 0
    
    // Process products one by one to avoid rate limiting
    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name} (${product.sku})`)
      
      const { imageUrl, productUrl } = await getProductImage(browser, product.name, product.sku)
      
      if (imageUrl) {
        const uploadedUrl = await downloadAndUploadImage(imageUrl, product.sku)
        
        if (uploadedUrl) {
          // Update product with image
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              images: [uploadedUrl],
              source_url: productUrl 
            })
            .eq('id', product.id)
          
          if (!updateError) {
            successCount++
            console.log(`  ✅ Successfully updated product`)
          }
        }
      }
      
      // Add delay to avoid rate limiting
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
scrapeLuckyImages()