#!/usr/bin/env bun

/**
 * Reliable Lucky Supply Product Scraper using FireCrawl
 * Based on the successful initial test, optimized for consistency
 */

import { firecrawlApp } from '@/lib/vendors/firecrawl';
import fs from 'fs/promises';
import path from 'path';

interface LuckySupplyProduct {
  handle: string;
  sku: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  compare_at_price?: number;
  in_stock: boolean;
  stock_quantity?: number;
  images: string[];
  attachments: string[];
  tags: string[];
  variants: ProductVariant[];
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

/**
 * Simplified but effective AI prompt - based on our working version
 */
const RELIABLE_PRODUCT_EXTRACTION_PROMPT = `
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
- Any downloadable files (PDFs, documents)

REQUIREMENTS:
- Extract complete product data, not just basic info
- Include all product variants with their own SKUs and prices
- Get high-resolution image URLs
- Capture detailed descriptions
- Note if products are in stock or out of stock
- Include brand information (should be Lucky Supply)
- Find any PDF attachments, safety sheets, or documentation links

Return as structured JSON with high confidence scores for accurate data only.
Focus on accuracy and completeness. This data will be used to populate a product catalog.
`;

/**
 * Scrape a single product page - reliable version
 */
async function scrapeProductPageReliable(productUrl: string, retryCount = 0): Promise<LuckySupplyProduct | null> {
  const maxRetries = 1;
  
  console.log(`🔥 Scraping product: ${productUrl}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  try {
    const startTime = Date.now();
    
    // Use FireCrawl with simpler, proven extraction
    const scrapeResponse = await firecrawlApp.scrapeUrl(productUrl, {
      formats: ['extract'],
      extract: {
        prompt: RELIABLE_PRODUCT_EXTRACTION_PROMPT,
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
                  attachments: { type: 'array', items: { type: 'string' } },
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
      },
      timeout: 45000 // 45 second timeout
    });

    const processingTime = Date.now() - startTime;
    
    if (!scrapeResponse.success || !scrapeResponse.extract) {
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return scrapeProductPageReliable(productUrl, retryCount + 1);
      }
      
      console.error(`❌ Failed to scrape ${productUrl}: ${scrapeResponse.error || 'No data extracted'}`);
      return null;
    }

    const extractedData = scrapeResponse.extract as any;
    
    if (!extractedData.products || extractedData.products.length === 0) {
      console.warn(`⚠️ No products found on ${productUrl}`);
      return null;
    }

    const product = extractedData.products[0];
    
    // Create reliable product object with fallbacks
    const luckyProduct: LuckySupplyProduct = {
      handle: product.handle || productUrl.split('/').pop() || '',
      sku: product.sku || `LS-${Date.now()}`,
      name: product.name || 'Unknown Product',
      description: product.description || '',
      brand: 'Lucky Supply',
      category: product.category || 'Tattoo Supplies',
      price: product.price || 0,
      compare_at_price: product.compare_at_price,
      in_stock: product.in_stock ?? true,
      stock_quantity: product.stock_quantity,
      images: Array.isArray(product.images) ? product.images : [],
      attachments: Array.isArray(product.attachments) ? product.attachments : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      source_url: productUrl,
      firecrawl_confidence: extractedData.confidence || 0.8,
      scraped_at: new Date().toISOString()
    };

    console.log(`✅ Scraped: ${luckyProduct.name} | $${luckyProduct.price} | Images: ${luckyProduct.images.length} | Variants: ${luckyProduct.variants.length} (${processingTime}ms)`);
    return luckyProduct;
    
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`🔄 Error occurred, retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return scrapeProductPageReliable(productUrl, retryCount + 1);
    }
    
    console.error(`❌ Error scraping ${productUrl}:`, error.message);
    return null;
  }
}

/**
 * Main scraping function - processes all products reliably
 */
async function scrapeAllLuckySupplyReliable() {
  console.log(`🚀 Starting RELIABLE Lucky Supply scraping with FireCrawl...`);
  
  try {
    // Load all product IDs
    const idsPath = path.join(process.cwd(), 'data', 'lucky-product-ids.json');
    const idsContent = await fs.readFile(idsPath, 'utf-8');
    const productIds = JSON.parse(idsContent) as string[];
    
    console.log(`📋 Found ${productIds.length} total product IDs to scrape`);
    
    // Convert to URLs
    const productUrls = productIds.map(id => `https://luckysupplyusa.com/products/${id}`);
    
    const startTime = Date.now();
    const products: LuckySupplyProduct[] = [];
    const failed: string[] = [];
    
    // Process with smaller, more reliable batches
    const batchSize = 2;
    const totalBatches = Math.ceil(productUrls.length / batchSize);
    
    console.log(`📦 Processing ${productUrls.length} products in ${totalBatches} batches of ${batchSize}`);
    console.log(`⏱️ Estimated time: ${Math.round((productUrls.length * 12) / 60)} minutes\n`);
    
    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (Products ${i + 1}-${Math.min(i + batchSize, productUrls.length)})`);
      
      // Process batch sequentially for reliability
      for (const url of batch) {
        const result = await scrapeProductPageReliable(url);
        if (result) {
          products.push(result);
        } else {
          failed.push(url);
        }
        
        // Small delay between individual requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`✅ Batch ${batchNum} complete: ${products.length} total products scraped`);
      console.log(`📊 Success rate: ${Math.round((products.length / (i + batch.length)) * 100)}% | Failed: ${failed.length}`);
      
      // Save checkpoint every 20 batches
      if (batchNum % 20 === 0 || batchNum === totalBatches) {
        const outputDir = path.join(process.cwd(), 'data');
        await fs.mkdir(outputDir, { recursive: true });
        
        const checkpointPath = path.join(outputDir, `lucky-reliable-checkpoint-${batchNum}.json`);
        await fs.writeFile(checkpointPath, JSON.stringify(products, null, 2));
        console.log(`💾 Checkpoint saved: ${checkpointPath}`);
      }
      
      // Longer delay between batches
      if (i + batchSize < productUrls.length) {
        console.log('⏳ Waiting 8 seconds between batches...');
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Calculate statistics
    const totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
    const totalAttachments = products.reduce((sum, p) => sum + p.attachments.length, 0);
    const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
    const avgConfidence = products.length > 0 
      ? products.reduce((sum, p) => sum + p.firecrawl_confidence, 0) / products.length 
      : 0;
    
    const result = {
      success: products.length > 0,
      products,
      total_products_attempted: productUrls.length,
      total_products_scraped: products.length,
      processing_time_ms: processingTime,
      failed_urls: failed,
      summary: {
        success_rate: (products.length / productUrls.length) * 100,
        avg_confidence: avgConfidence,
        total_images: totalImages,
        total_attachments: totalAttachments,
        total_variants: totalVariants
      }
    };
    
    console.log(`\n🏁 RELIABLE SCRAPING COMPLETED!`);
    console.log(`✅ Successfully scraped: ${products.length}/${productUrls.length} products (${result.summary.success_rate.toFixed(1)}%)`);
    console.log(`🖼️ Total images: ${totalImages}`);
    console.log(`📎 Total attachments: ${totalAttachments}`);
    console.log(`🎯 Total variants: ${totalVariants}`);
    console.log(`⏱️ Total time: ${Math.round(processingTime / 1000 / 60)} minutes`);
    console.log(`🎯 Average confidence: ${avgConfidence.toFixed(2)}`);
    
    // Save final results
    const outputDir = path.join(process.cwd(), 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'lucky-supply-reliable-complete.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\n💾 Complete results saved to: ${outputPath}`);
    
    // Save products in Supabase format
    const supabaseProducts = products.map(product => ({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      brand: product.brand,
      in_stock: product.in_stock,
      stock_quantity: product.stock_quantity,
      tags: product.tags,
      attachments: product.attachments,
      source_url: product.source_url
    }));
    
    const supabasePath = path.join(outputDir, 'lucky-supply-for-supabase.json');
    await fs.writeFile(supabasePath, JSON.stringify(supabaseProducts, null, 2));
    
    console.log(`📊 Supabase-ready data saved to: ${supabasePath}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to load product IDs:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 Lucky Supply Reliable Product Scraper');
    console.log('Optimized for consistency and high success rates\n');
    
    const result = await scrapeAllLuckySupplyReliable();
    
    if (result.summary.total_attachments > 0) {
      console.log('\n📎 Sample attachments found:');
      const productWithAttachments = result.products.find(p => p.attachments.length > 0);
      if (productWithAttachments) {
        productWithAttachments.attachments.slice(0, 3).forEach(att => {
          console.log(`  • ${att}`);
        });
      }
    }
    
    console.log('\n🚀 Ready to import to database!');
    console.log('Run: bun run scripts/import-firecrawl-to-supabase.ts --import');
    
  } catch (error) {
    console.error('❌ Reliable scraping failed:', error);
    
    if (error.message.includes('FIRECRAWL_API_KEY')) {
      console.log('\n🔑 FireCrawl API key issue detected');
      console.log('Make sure FIRECRAWL_API_KEY is set in your .env.local file');
    }
    
    process.exit(1);
  }
}

// Run the reliable scraper
if (import.meta.main) {
  main();
}