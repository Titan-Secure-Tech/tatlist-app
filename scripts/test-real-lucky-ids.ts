#!/usr/bin/env bun

import fs from 'fs/promises'
import path from 'path'

const LUCKY_SUPPLY_API_BASE = 'https://luckysupplyapps.com/product_api/getProduct.php'

async function testRealLuckyIds() {
  console.log('🧪 Testing Real Lucky Supply Product IDs...\n')
  
  try {
    // Load the scraped product IDs
    const idsPath = path.join(process.cwd(), 'data', 'lucky-product-ids.json')
    const idsContent = await fs.readFile(idsPath, 'utf-8')
    const productIds = JSON.parse(idsContent) as string[]
    
    console.log(`Testing ${productIds.length} scraped product IDs...\n`)
    
    // Test first 10 product IDs
    const testIds = productIds.slice(0, 10)
    
    for (const productId of testIds) {
      console.log(`Testing ID: ${productId}`)
      
      try {
        const response = await fetch(`${LUCKY_SUPPLY_API_BASE}?product_id=${productId}`)
        console.log(`  Status: ${response.status}`)
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          console.log(`  Content-Type: ${contentType}`)
          
          const text = await response.text()
          console.log(`  Response length: ${text.length} chars`)
          
          if (text.length > 0 && text !== 'null') {
            try {
              const data = JSON.parse(text)
              console.log(`  ✅ Valid JSON response`)
              console.log(`  Title: ${data.title || 'N/A'}`)
              console.log(`  Description: ${data.description ? data.description.substring(0, 100) + '...' : 'N/A'}`)
              console.log(`  Images: ${data.images?.nodes?.length || 0}`)
              console.log(`  Variants: ${data.variants?.length || 0}`)
              
              if (data.images?.nodes?.length > 0) {
                console.log(`  First image: ${data.images.nodes[0].src}`)
              }
              
              if (data.variants?.length > 0) {
                console.log(`  First variant: ${data.variants[0].title} - $${data.variants[0].price}`)
              }
            } catch (e) {
              console.log(`  ❌ Invalid JSON: ${text.substring(0, 100)}...`)
            }
          } else {
            console.log(`  ⚠️  Empty or null response`)
          }
        } else {
          console.log(`  ❌ Failed: ${response.statusText}`)
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`)
      }
      
      console.log('')
    }
    
  } catch (error) {
    console.error('Failed to load product IDs:', error)
    console.log('Make sure you run: bun run scripts/scrape-lucky-ids-simple.ts first')
  }
}

testRealLuckyIds()