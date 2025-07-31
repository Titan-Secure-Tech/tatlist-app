#!/usr/bin/env bun

import puppeteer from 'puppeteer'

async function testAccess() {
  console.log('🧪 Testing access to Lucky Supply...')
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Test basic access
    console.log('📡 Attempting to load Lucky Supply homepage...')
    const response = await page.goto('https://www.luckysupply.com', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })
    
    console.log(`✅ Response status: ${response?.status()}`)
    
    // Get page title
    const title = await page.title()
    console.log(`📄 Page title: ${title}`)
    
    // Try a simple search
    console.log('\n🔍 Testing search functionality...')
    await page.goto('https://www.luckysupply.com/search?q=spirit', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })
    
    // Check if products are found
    const productCount = await page.evaluate(() => {
      const products = document.querySelectorAll('[class*="product"], .grid-item, .product-grid-item')
      return products.length
    })
    
    console.log(`📦 Found ${productCount} products in search results`)
    
    // Try to get first product info
    if (productCount > 0) {
      const firstProduct = await page.evaluate(() => {
        const product = document.querySelector('[class*="product"], .grid-item, .product-grid-item')
        const title = product?.querySelector('h3, h4, [class*="title"], [class*="name"]')?.textContent?.trim()
        const link = product?.querySelector('a')?.href
        const img = product?.querySelector('img')?.src
        
        return { title, link, img }
      })
      
      console.log('\n📋 First product found:')
      console.log(`  Title: ${firstProduct.title || 'Not found'}`)
      console.log(`  Link: ${firstProduct.link || 'Not found'}`)
      console.log(`  Image: ${firstProduct.img ? 'Found' : 'Not found'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await browser.close()
  }
}

testAccess()