#!/usr/bin/env bun

/**
 * Lucky Supply Product Scraper using FireCrawl
 * Scrapes detailed product information from Lucky Supply website
 */

import { firecrawlApp } from '@/lib/vendors/firecrawl';
import fs from 'fs/promises';
import path from 'path';

interface LuckySupplyProduct {
  // Product identifiers
  handle: string; // URL slug
  sku: string;
  
  // Basic information
  name: string;
  description: string;
  brand: string;
  category: string;
  
  // Pricing and availability
  price: number;
  compare_at_price?: number;
  in_stock: boolean;
  stock_quantity?: number;
  
  // Media and additional data
  images: string[];
  tags: string[];
  variants: ProductVariant[];
  
  // Metadata
  source_url: string;
  firecrawl_confidence: number;
  scraped_at: string;
}

interface ProductVariant {
  title: string;
  sku: string;
  price: number;
  available: boolean;
  option1?: string;
  option2?: string;
  option3?: string;
}

interface ScrapingResult {
  success: boolean;
  products: LuckySupplyProduct[];
  total_products_found: number;
  processing_time_ms: number;
  error_message?: string;
}

/**
 * AI prompt for extracting product information from Lucky Supply pages
 */
const PRODUCT_EXTRACTION_PROMPT = `
Extract DETAILED PRODUCT INFORMATION from this Lucky Supply product page.

For each product, extract:
- Full product name/title
- Product SKU/model number
- Detailed description
- Price (current and compare-at price if available)
- Stock status and quantity
- Category/product type
- All product images (URLs)
- Product variants (sizes, colors, options)
- Product tags/keywords
- Any specifications or features

REQUIREMENTS:
- Extract complete product data, not just basic info
- Include all product variants with their own SKUs and prices
- Get high-resolution image URLs
- Capture detailed descriptions and specifications
- Note if products are in stock or out of stock
- Include brand information (should be Lucky Supply)

Return as structured JSON with:
{
  "products": [
    {
      "handle": "product-url-slug",
      "sku": "product-sku", 
      "name": "Full Product Name",
      "description": "Detailed product description",
      "brand": "Lucky Supply",
      "category": "Product Category",
      "price": 99.99,
      "compare_at_price": 119.99,
      "in_stock": true,
      "stock_quantity": 10,
      "images": ["image1.jpg", "image2.jpg"],
      "tags": ["tag1", "tag2"],
      "variants": [
        {
          "title": "Default Title",
          "sku": "variant-sku",
          "price": 99.99,
          "available": true,
          "option1": "Color",
          "option2": "Size"
        }
      ]
    }
  ],
  "confidence": 0.95
}

Focus on accuracy and completeness. This data will be used to populate a product catalog.
`;

/**
 * Scrape a single product page from Lucky Supply
 */
async function scrapeProductPage(productUrl: string): Promise<LuckySupplyProduct | null> {
  console.log(`🔥 Scraping product: ${productUrl}`);
  
  try {
    const startTime = Date.now();
    
    // Use FireCrawl to scrape and extract structured data
    const scrapeResponse = await firecrawlApp.scrapeUrl(productUrl, {
      formats: ['extract'],
      extract: {
        prompt: PRODUCT_EXTRACTION_PROMPT,
        schema: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  handle: { type: 'string' },
                  sku: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  brand: { type: 'string' },
                  category: { type: 'string' },
                  price: { type: 'number' },
                  compare_at_price: { type: 'number' },
                  in_stock: { type: 'boolean' },
                  stock_quantity: { type: 'number' },
                  images: { type: 'array', items: { type: 'string' } },
                  tags: { type: 'array', items: { type: 'string' } },
                  variants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        sku: { type: 'string' },
                        price: { type: 'number' },
                        available: { type: 'boolean' },
                        option1: { type: 'string' },
                        option2: { type: 'string' },
                        option3: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            confidence: { type: 'number' }
          }
        }
      }
    });

    const processingTime = Date.now() - startTime;
    
    if (!scrapeResponse.success || !scrapeResponse.extract) {
      console.error(`Failed to scrape ${productUrl}: ${scrapeResponse.error || 'No data extracted'}`);
      return null;
    }

    const extractedData = scrapeResponse.extract as any;
    
    if (!extractedData.products || extractedData.products.length === 0) {
      console.warn(`No products found on ${productUrl}`);
      return null;
    }

    const product = extractedData.products[0];
    
    // Add metadata
    const luckyProduct: LuckySupplyProduct = {
      ...product,
      source_url: productUrl,
      firecrawl_confidence: extractedData.confidence || 0.8,
      scraped_at: new Date().toISOString(),
      brand: 'Lucky Supply' // Ensure brand is set correctly
    };

    console.log(`✅ Successfully scraped: ${luckyProduct.name} (${processingTime}ms)`);
    return luckyProduct;
    
  } catch (error) {
    console.error(`❌ Error scraping ${productUrl}:`, error);
    return null;
  }
}

/**
 * Scrape multiple product pages from Lucky Supply
 */
async function scrapeLuckySupplyProducts(productUrls: string[]): Promise<ScrapingResult> {
  console.log(`🚀 Starting Lucky Supply scraping with FireCrawl...`);
  console.log(`📄 Scraping ${productUrls.length} product pages`);
  
  const startTime = Date.now();
  const products: LuckySupplyProduct[] = [];
  const errors: string[] = [];
  
  // Process products in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < productUrls.length; i += batchSize) {
    const batch = productUrls.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(productUrls.length/batchSize)}`);
    
    const batchPromises = batch.map(url => scrapeProductPage(url));
    const batchResults = await Promise.all(batchPromises);
    
    for (const result of batchResults) {
      if (result) {
        products.push(result);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < productUrls.length) {
      console.log('⏳ Waiting 2 seconds between batches...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const processingTime = Date.now() - startTime;
  
  const result: ScrapingResult = {
    success: products.length > 0,
    products,
    total_products_found: products.length,
    processing_time_ms: processingTime,
    error_message: errors.length > 0 ? errors.join('; ') : undefined
  };
  
  console.log(`\n🏁 Scraping complete!`);
  console.log(`✅ Successfully scraped: ${products.length}/${productUrls.length} products`);
  console.log(`⏱️  Total time: ${processingTime}ms`);
  
  return result;
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Load the product IDs we scraped earlier
    const idsPath = path.join(process.cwd(), 'data', 'lucky-product-ids.json');
    const idsContent = await fs.readFile(idsPath, 'utf-8');
    const productIds = JSON.parse(idsContent) as string[];
    
    console.log(`📋 Found ${productIds.length} product IDs to scrape`);
    
    // Convert product IDs to full URLs
    const productUrls = productIds
      .slice(0, 10) // Start with first 10 products for testing
      .map(id => `https://luckysupplyusa.com/products/${id}`);
    
    console.log(`🎯 Testing with first ${productUrls.length} products`);
    
    // Scrape the products
    const result = await scrapeLuckySupplyProducts(productUrls);
    
    // Save the results
    const outputDir = path.join(process.cwd(), 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'lucky-supply-firecrawl-products.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\n💾 Results saved to: ${outputPath}`);
    
    // Show sample of scraped products
    if (result.products.length > 0) {
      console.log('\n📊 Sample scraped product:');
      console.log(JSON.stringify(result.products[0], null, 2));
      
      console.log('\n📈 Scraping Summary:');
      console.log(`• Products scraped: ${result.products.length}`);
      console.log(`• Average confidence: ${(result.products.reduce((sum, p) => sum + p.firecrawl_confidence, 0) / result.products.length).toFixed(2)}`);
      console.log(`• Processing time: ${result.processing_time_ms}ms`);
      console.log(`• Products with images: ${result.products.filter(p => p.images.length > 0).length}`);
    }
    
  } catch (error) {
    console.error('❌ FireCrawl scraping failed:', error);
    
    if (error.message.includes('FIRECRAWL_API_KEY')) {
      console.log('\n🔑 You need to set up a FireCrawl API key:');
      console.log('1. Sign up at https://firecrawl.dev');
      console.log('2. Add FIRECRAWL_API_KEY to your .env.local file');
      console.log('3. Re-run this script');
    }
    
    process.exit(1);
  }
}

// Run the scraper
if (import.meta.main) {
  main();
}