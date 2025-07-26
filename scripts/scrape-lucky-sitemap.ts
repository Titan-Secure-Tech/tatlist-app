import puppeteer, { Page } from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

interface ProductData {
  id: string
  handle: string
  url: string
  title: string
  description?: string
  price?: string
  images: string[]
  category?: string
  vendor?: string
  tags?: string[]
  variants?: any[]
  attachments?: string[]
  metaData?: any
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    await page.goto(sitemapUrl, { waitUntil: 'domcontentloaded' })
    
    const urls = await page.evaluate(() => {
      const urlElements = document.querySelectorAll('url loc')
      return Array.from(urlElements)
        .map(el => el.textContent || '')
        .filter(url => url.includes('/products/'))
    })
    
    await browser.close()
    return urls
  } catch (error) {
    await browser.close()
    throw error
  }
}

async function scrapeProductPage(page: Page, url: string): Promise<ProductData | null> {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Wait for essential elements
    await page.waitForSelector('h1', { timeout: 10000 })

    const productData = await page.evaluate((url) => {
      const data: any = {
        url,
        handle: url.split('/products/')[1]?.split('?')[0] || '',
        id: '',
        title: '',
        description: '',
        images: [],
        attachments: [],
        metaData: {}
      }

      // Extract ID from handle
      data.id = data.handle

      // Get title
      const titleElement = document.querySelector('h1, .product-title, .product__title')
      if (titleElement) {
        data.title = titleElement.textContent?.trim() || ''
      }

      // Get description
      const descElement = document.querySelector('.product-description, .product__description, .description')
      if (descElement) {
        data.description = descElement.innerHTML?.trim() || ''
      }

      // Get structured data if available
      const ldJsonScript = document.querySelector('script[type="application/ld+json"]')
      if (ldJsonScript) {
        try {
          const ldJson = JSON.parse(ldJsonScript.textContent || '{}')
          if (ldJson['@type'] === 'Product') {
            data.metaData = ldJson
            if (ldJson.offers) {
              data.price = ldJson.offers.price || ldJson.offers.lowPrice
            }
            if (ldJson.brand) {
              data.vendor = ldJson.brand.name
            }
            if (ldJson.category) {
              data.category = ldJson.category
            }
          }
        } catch (e) {}
      }

      // Get price if not from structured data
      if (!data.price) {
        const priceElement = document.querySelector('.price, .product-price, .product__price, [data-product-price]')
        if (priceElement) {
          data.price = priceElement.textContent?.trim()
        }
      }

      // Get vendor
      if (!data.vendor) {
        const vendorElement = document.querySelector('.vendor, .product-vendor, .product__vendor')
        if (vendorElement) {
          data.vendor = vendorElement.textContent?.trim()
        }
      }

      // Get all product images
      const imageSelectors = [
        '.product__media img',
        '.product-images img',
        '.product-photo img',
        'img[data-product-image]',
        '.product__image',
        '[data-zoom]'
      ]
      
      const imageSet = new Set<string>()
      imageSelectors.forEach(selector => {
        const images = document.querySelectorAll(selector)
        images.forEach(img => {
          const src = (img as HTMLImageElement).src || img.getAttribute('data-src') || img.getAttribute('href')
          if (src && !src.includes('data:image') && src.startsWith('http')) {
            // Get the largest version of the image
            const cleanSrc = src.split('?')[0].replace(/_\d+x\d+/, '').replace(/_small|_medium|_large|_thumb/, '')
            imageSet.add(cleanSrc)
          }
        })
      })
      data.images = Array.from(imageSet)

      // Get tags
      const tagElements = document.querySelectorAll('.tag, .product-tag, a[href*="/collections/"]')
      const tagSet = new Set<string>()
      tagElements.forEach(tag => {
        const text = tag.textContent?.trim()
        if (text && text.length < 50) {
          tagSet.add(text)
        }
      })
      data.tags = Array.from(tagSet)

      // Get attachments (PDFs, instructions, etc.)
      const attachmentSelectors = [
        'a[href*=".pdf"]',
        'a[href*=".doc"]',
        'a[download]',
        'a[href*="/files/"]',
        '.downloads a'
      ]
      
      const attachmentSet = new Set<string>()
      attachmentSelectors.forEach(selector => {
        const links = document.querySelectorAll(selector)
        links.forEach(link => {
          const href = (link as HTMLAnchorElement).href
          if (href && href.startsWith('http')) {
            attachmentSet.add(href)
          }
        })
      })
      data.attachments = Array.from(attachmentSet)

      // Try to get product JSON data
      const productJsonScript = document.querySelector('script[data-product-json], script[type="application/json"][data-product]')
      if (productJsonScript) {
        try {
          const productJson = JSON.parse(productJsonScript.textContent || '{}')
          data.variants = productJson.variants || []
          if (!data.id && productJson.id) {
            data.id = productJson.id.toString()
          }
        } catch (e) {}
      }

      return data
    }, url)

    return productData
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error)
    return null
  }
}

async function scrapeLuckySupplySitemap() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    // First, try to get product URLs from sitemap
    console.log('Checking for sitemap...')
    let productUrls: string[] = []
    
    try {
      // Try multiple possible sitemap locations
      const sitemapUrls = [
        'https://luckysupplyusa.com/sitemap.xml',
        'https://luckysupplyusa.com/sitemap_products_1.xml',
        'https://luckysupplyusa.com/products.xml'
      ]
      
      for (const sitemapUrl of sitemapUrls) {
        try {
          const urls = await fetchSitemapUrls(sitemapUrl)
          if (urls.length > 0) {
            productUrls = urls
            console.log(`Found ${urls.length} product URLs in sitemap`)
            break
          }
        } catch (e) {}
      }
    } catch (error) {
      console.log('Could not fetch sitemap, will scrape collections instead')
    }

    const page = await browser.newPage()
    
    // If no sitemap, get URLs from collections
    if (productUrls.length === 0) {
      console.log('Fetching product URLs from collections...')
      
      await page.goto('https://luckysupplyusa.com/collections/all', {
        waitUntil: 'networkidle2',
        timeout: 60000
      })

      // Scroll to load all products if infinite scroll
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0
          const distance = 100
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight
            window.scrollBy(0, distance)
            totalHeight += distance

            if (totalHeight >= scrollHeight) {
              clearInterval(timer)
              resolve(void 0)
            }
          }, 100)
        })
      })

      productUrls = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="/products/"]')
        const urlSet = new Set<string>()
        links.forEach(link => {
          const href = (link as HTMLAnchorElement).href
          if (href && !href.includes('#') && !href.includes('?')) {
            urlSet.add(href)
          }
        })
        return Array.from(urlSet)
      })
    }

    console.log(`Total products to scrape: ${productUrls.length}`)

    const allProducts: ProductData[] = []
    const batchSize = 5 // Process 5 products at a time
    
    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize)
      const batchPromises = batch.map(async (url) => {
        const productPage = await browser.newPage()
        try {
          const product = await scrapeProductPage(productPage, url)
          if (product) {
            console.log(`✓ Scraped: ${product.title}`)
            return product
          }
        } catch (error) {
          console.error(`✗ Failed: ${url}`)
        } finally {
          await productPage.close()
        }
        return null
      })
      
      const batchResults = await Promise.all(batchPromises)
      allProducts.push(...batchResults.filter(p => p !== null) as ProductData[])
      
      console.log(`Progress: ${Math.min(i + batchSize, productUrls.length)}/${productUrls.length}`)
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Save the complete data
    const outputDir = path.join(process.cwd(), 'data')
    await fs.mkdir(outputDir, { recursive: true })
    
    const jsonPath = path.join(outputDir, 'lucky-supply-complete.json')
    await fs.writeFile(jsonPath, JSON.stringify(allProducts, null, 2))
    console.log(`\nSaved ${allProducts.length} products to ${jsonPath}`)

    // Create a summary with just IDs and handles for the API sync
    const productIds = allProducts.map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      url: p.url
    }))
    
    const idsPath = path.join(outputDir, 'lucky-supply-ids.json')
    await fs.writeFile(idsPath, JSON.stringify(productIds, null, 2))
    console.log(`Saved product IDs to ${idsPath}`)

    // Create CSV for easy viewing
    const csvContent = [
      'id,handle,title,price,vendor,category,images,attachments,url',
      ...allProducts.map(p => [
        p.id,
        p.handle,
        `"${p.title.replace(/"/g, '""')}"`,
        p.price || '',
        p.vendor || '',
        p.category || '',
        p.images.length,
        p.attachments?.length || 0,
        p.url
      ].join(','))
    ].join('\n')
    
    const csvPath = path.join(outputDir, 'lucky-supply-complete.csv')
    await fs.writeFile(csvPath, csvContent)
    console.log(`Saved CSV to ${csvPath}`)

  } catch (error) {
    console.error('Scraping failed:', error)
  } finally {
    await browser.close()
  }
}

// Run the scraper
scrapeLuckySupplySitemap().catch(console.error)