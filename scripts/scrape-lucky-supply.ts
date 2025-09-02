import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

interface ProductData {
  id: string
  url: string
  title: string
  description?: string
  price?: string
  images: string[]
  category?: string
  vendor?: string
  tags?: string[]
  variants?: Array<{ title: string; sku: string; price: string; available: boolean }>
  attachments?: string[]
}

async function scrapeLuckySupply() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true in production
    defaultViewport: null,
  })

  try {
    const page = await browser.newPage()

    // Start from the main catalog page
    console.log('Navigating to Lucky Supply catalog...')
    await page.goto('https://luckysupplyusa.com/collections/all', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    // Wait for products to load
    await page.waitForSelector('.product-item', { timeout: 30000 })

    // Get total number of pages (if pagination exists)
    const totalPages = await page.evaluate(() => {
      const pagination = document.querySelector('.pagination')
      if (!pagination) return 1

      const lastPageLink = Array.from(pagination.querySelectorAll('a'))
        .map(a => parseInt(a.textContent || '0'))
        .filter(n => !isNaN(n))
        .sort((a, b) => b - a)[0]

      return lastPageLink || 1
    })

    console.log(`Found ${totalPages} pages to scrape`)

    const allProducts: ProductData[] = []

    // Scrape each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) {
        const pageUrl = `https://luckysupplyusa.com/collections/all?page=${pageNum}`
        console.log(`Navigating to page ${pageNum}...`)
        await page.goto(pageUrl, {
          waitUntil: 'networkidle2',
          timeout: 60000,
        })
        await page.waitForSelector('.product-item', { timeout: 30000 })
      }

      // Get all product URLs on this page
      const productUrls = await page.evaluate(() => {
        const products = document.querySelectorAll('.product-item a')
        return Array.from(products)
          .map(link => (link as HTMLAnchorElement).href)
          .filter(url => url.includes('/products/'))
      })

      console.log(`Found ${productUrls.length} products on page ${pageNum}`)

      // Scrape each product
      for (const productUrl of productUrls) {
        try {
          console.log(`Scraping: ${productUrl}`)

          // Navigate to product page
          await page.goto(productUrl, {
            waitUntil: 'networkidle2',
            timeout: 60000,
          })

          // Extract product data
          const productData = await page.evaluate(url => {
            const data: LuckyProduct = {
              url,
              id: url.split('/products/')[1]?.split('?')[0] || '',
              title: document.querySelector('h1')?.textContent?.trim() || '',
              description: document.querySelector('.product-description')?.innerHTML || '',
              images: [],
              attachments: [],
            }

            // Get price
            const priceElement = document.querySelector('.product-price, .price')
            if (priceElement) {
              data.price = priceElement.textContent?.trim()
            }

            // Get vendor
            const vendorElement = document.querySelector('.product-vendor, .vendor')
            if (vendorElement) {
              data.vendor = vendorElement.textContent?.trim()
            }

            // Get category from breadcrumbs or meta
            const breadcrumbs = document.querySelectorAll('.breadcrumb a')
            if (breadcrumbs.length > 1) {
              data.category = breadcrumbs[breadcrumbs.length - 2].textContent?.trim()
            }

            // Get all images
            const imageElements = document.querySelectorAll(
              '.product-images img, .product-photo img, img[data-product-image]'
            )
            data.images = Array.from(imageElements)
              .map(img => (img as HTMLImageElement).src)
              .filter(src => src && !src.includes('data:image'))

            // Get tags
            const tagElements = document.querySelectorAll('.product-tags a, .tag')
            data.tags = Array.from(tagElements).map(tag => tag.textContent?.trim() || '')

            // Get attachments (PDFs, docs, etc.)
            const attachmentLinks = document.querySelectorAll(
              'a[href*=".pdf"], a[href*=".doc"], a[download]'
            )
            data.attachments = Array.from(attachmentLinks)
              .map(link => (link as HTMLAnchorElement).href)
              .filter(href => href)

            // Get variant data if available
            const variantScript = document.querySelector(
              'script[type="application/json"][data-product-json]'
            )
            if (variantScript) {
              try {
                const productJson = JSON.parse(variantScript.textContent || '{}')
                data.variants = productJson.variants
              } catch {
                console.error('Failed to parse variant data')
              }
            }

            return data
          }, productUrl)

          allProducts.push(productData)

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to scrape ${productUrl}:`, error)
        }
      }
    }

    // Save the scraped data
    const outputPath = path.join(process.cwd(), 'data', 'lucky-supply-products.json')
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(allProducts, null, 2))

    console.log(`Scraping complete! Saved ${allProducts.length} products to ${outputPath}`)

    // Also save a simplified CSV for quick reference
    const csvData = allProducts.map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      price: p.price,
      vendor: p.vendor,
      category: p.category,
      image_count: p.images.length,
      has_attachments: p.attachments && p.attachments.length > 0,
    }))

    const csvPath = path.join(process.cwd(), 'data', 'lucky-supply-products.csv')
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(',')
      ),
    ].join('\n')

    await fs.writeFile(csvPath, csvContent)
    console.log(`Also saved CSV summary to ${csvPath}`)
  } catch (error) {
    console.error('Scraping failed:', error)
  } finally {
    await browser.close()
  }
}

// Run the scraper
scrapeLuckySupply().catch(console.error)
