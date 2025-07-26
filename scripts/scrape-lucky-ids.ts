import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

async function scrapeLuckyProductIds() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })

  try {
    const page = await browser.newPage()
    const productIds = new Set<string>()
    
    console.log('Starting to collect product IDs from Lucky Supply...')
    
    // Start with the all products page
    await page.goto('https://luckysupplyusa.com/collections/all', {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    let hasNextPage = true
    let pageNum = 1

    while (hasNextPage) {
      console.log(`Scraping page ${pageNum}...`)
      
      // Wait for products to load
      await page.waitForSelector('a[href*="/products/"]', { timeout: 30000 })
      
      // Extract product IDs from URLs
      const pageProductIds = await page.evaluate(() => {
        const productLinks = document.querySelectorAll('a[href*="/products/"]')
        const ids = new Set<string>()
        
        productLinks.forEach(link => {
          const href = (link as HTMLAnchorElement).href
          const match = href.match(/\/products\/([^?#]+)/)
          if (match && match[1]) {
            ids.add(match[1])
          }
        })
        
        return Array.from(ids)
      })
      
      pageProductIds.forEach(id => productIds.add(id))
      console.log(`Found ${pageProductIds.length} unique products on page ${pageNum}`)
      
      // Check if there's a next page
      const nextPageExists = await page.evaluate(() => {
        const nextLink = document.querySelector('a[rel="next"], .pagination a:contains("Next"), .pagination a:contains("→")')
        return !!nextLink
      })
      
      if (nextPageExists) {
        // Click next page
        await page.evaluate(() => {
          const nextLink = document.querySelector('a[rel="next"], .pagination a:contains("Next"), .pagination a:contains("→")') as HTMLAnchorElement
          if (nextLink) nextLink.click()
        })
        
        // Wait for new products to load
        await page.waitForTimeout(2000)
        pageNum++
      } else {
        // Try URL-based pagination as backup
        pageNum++
        const nextUrl = `https://luckysupplyusa.com/collections/all?page=${pageNum}`
        
        await page.goto(nextUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        }).catch(() => {})
        
        // Check if we're still on a valid page with products
        const productsExist = await page.evaluate(() => {
          return document.querySelectorAll('a[href*="/products/"]').length > 0
        })
        
        hasNextPage = productsExist
      }
    }
    
    // Also check other collection pages for any missed products
    const additionalCollections = [
      'https://luckysupplyusa.com/collections/tattoo-equipment-supplies',
      'https://luckysupplyusa.com/collections/tattoo-inks',
      'https://luckysupplyusa.com/collections/tattoo-needles',
      'https://luckysupplyusa.com/collections/medical-disposables',
      'https://luckysupplyusa.com/collections/permanent-makeup',
      'https://luckysupplyusa.com/collections/piercing-supplies'
    ]
    
    for (const collectionUrl of additionalCollections) {
      try {
        console.log(`Checking collection: ${collectionUrl}`)
        await page.goto(collectionUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        })
        
        const collectionProductIds = await page.evaluate(() => {
          const productLinks = document.querySelectorAll('a[href*="/products/"]')
          const ids = new Set<string>()
          
          productLinks.forEach(link => {
            const href = (link as HTMLAnchorElement).href
            const match = href.match(/\/products\/([^?#]+)/)
            if (match && match[1]) {
              ids.add(match[1])
            }
          })
          
          return Array.from(ids)
        })
        
        const newIds = collectionProductIds.filter(id => !productIds.has(id))
        newIds.forEach(id => productIds.add(id))
        
        if (newIds.length > 0) {
          console.log(`Found ${newIds.length} new products in this collection`)
        }
      } catch (error) {
        console.log(`Failed to scrape collection: ${collectionUrl}`)
      }
    }
    
    const productIdArray = Array.from(productIds)
    console.log(`\nTotal unique product IDs found: ${productIdArray.length}`)
    
    // Save the IDs
    const outputDir = path.join(process.cwd(), 'data')
    await fs.mkdir(outputDir, { recursive: true })
    
    const outputPath = path.join(outputDir, 'lucky-product-ids.json')
    await fs.writeFile(outputPath, JSON.stringify(productIdArray, null, 2))
    console.log(`Saved product IDs to ${outputPath}`)
    
    // Also save as text file for easy copy/paste
    const textPath = path.join(outputDir, 'lucky-product-ids.txt')
    await fs.writeFile(textPath, productIdArray.join('\n'))
    console.log(`Saved product IDs as text to ${textPath}`)
    
    return productIdArray
    
  } catch (error) {
    console.error('Error scraping product IDs:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Run the scraper
scrapeLuckyProductIds()
  .then(ids => {
    console.log('\nScraping complete!')
    console.log('Next steps:')
    console.log('1. Use these IDs with the Lucky Supply API to get full product data')
    console.log('2. Run: bun run scripts/fetch-lucky-products.ts')
  })
  .catch(console.error)