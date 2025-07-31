#!/usr/bin/env bun

const LUCKY_SUPPLY_API_BASE = 'https://luckysupplyapps.com/product_api/getProduct.php'

// Test with some common Lucky Supply product ID patterns
const testProductIds = [
  '8467954712788',  // Example from code
  '7543857324244',  // Common Spirit product ID
  '6789012345678',  // Test ID
  'KPAD092115',     // Our SKU format
  'spirit-classic-thermal-8-1-2-x-11' // Slug format
]

async function testLuckyApi() {
  console.log('🧪 Testing Lucky Supply API...\n')
  
  for (const productId of testProductIds) {
    console.log(`Testing ID: ${productId}`)
    
    try {
      const response = await fetch(`${LUCKY_SUPPLY_API_BASE}?product_id=${productId}`)
      console.log(`  Status: ${response.status}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        console.log(`  Content-Type: ${contentType}`)
        
        const text = await response.text()
        console.log(`  Response length: ${text.length} chars`)
        
        if (text.length > 0) {
          try {
            const data = JSON.parse(text)
            console.log(`  ✅ Valid JSON response`)
            console.log(`  Title: ${data.title || 'N/A'}`)
            console.log(`  Images: ${data.images?.nodes?.length || 0}`)
            
            if (data.images?.nodes?.length > 0) {
              console.log(`  First image: ${data.images.nodes[0].src}`)
            }
          } catch (e) {
            console.log(`  ❌ Invalid JSON: ${text.substring(0, 100)}...`)
          }
        } else {
          console.log(`  ⚠️  Empty response`)
        }
      } else {
        console.log(`  ❌ Failed: ${response.statusText}`)
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
    }
    
    console.log('')
  }
}

testLuckyApi()