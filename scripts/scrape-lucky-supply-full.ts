#!/usr/bin/env bun

/**
 * Complete Lucky Supply Product Scraper using FireCrawl
 * Scrapes ALL product information including attachments, PDFs, and documentation
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
  attachments: ProductAttachment[];
  tags: string[];
  variants: ProductVariant[];
  
  // Product specifications and details
  specifications?: Record<string, string>;
  features?: string[];
  materials?: string[];
  dimensions?: string;
  weight?: string;
  
  // Metadata
  source_url: string;
  firecrawl_confidence: number;
  scraped_at: string;
}

interface ProductAttachment {
  type: 'pdf' | 'doc' | 'safety_sheet' | 'manual' | 'specification' | 'other';
  name: string;
  url: string;
  description?: string;
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
  total_products_attempted: number;
  total_products_scraped: number;
  processing_time_ms: number;
  errors: string[];
  summary: {
    success_rate: number;
    avg_confidence: number;
    total_images: number;
    total_attachments: number;
    total_variants: number;
  };
}

/**
 * Enhanced AI prompt for extracting complete product information including attachments
 */
const ENHANCED_PRODUCT_EXTRACTION_PROMPT = `
Extract COMPLETE DETAILED PRODUCT INFORMATION from this Lucky Supply product page.

For each product, extract:

BASIC INFO:
- Full product name/title
- Product SKU/model number
- Detailed description (include all text, features, specifications)
- Price (current and compare-at price if on sale)
- Stock status and quantity available
- Product category/type
- Brand (should be Lucky Supply)
- Product tags/keywords

MEDIA & ATTACHMENTS:
- All product images (get high-resolution URLs)
- ALL downloadable files including:
  * PDF safety data sheets
  * Product manuals/instructions
  * Specification sheets
  * Certificates
  * Any other downloadable documents
- For each attachment, note the type and description

VARIANTS & OPTIONS:
- All product variants (sizes, colors, options)
- Each variant's SKU, price, and availability
- Option names (Size, Color, etc.)

SPECIFICATIONS:
- Detailed product specifications
- Features list
- Materials used
- Dimensions and measurements
- Weight
- Any technical details

Return as structured JSON:
{
  "products": [
    {
      "handle": "product-url-slug",
      "sku": "MAIN-SKU", 
      "name": "Full Product Name",
      "description": "Complete detailed description with all features and specs",
      "brand": "Lucky Supply",
      "category": "Specific Product Category",
      "price": 99.99,
      "compare_at_price": 119.99,
      "in_stock": true,
      "stock_quantity": 10,
      "images": ["image1.jpg", "image2.jpg"],
      "attachments": [
        {
          "type": "safety_sheet",
          "name": "Safety Data Sheet",
          "url": "https://example.com/safety.pdf",
          "description": "Product safety information"
        }
      ],
      "tags": ["tag1", "tag2"],
      "variants": [
        {
          "title": "Color: Red, Size: Large",
          "sku": "SKU-RED-LG",
          "price": 99.99,
          "available": true,
          "option1": "Red",
          "option2": "Large"
        }
      ],
      "specifications": {
        "Material": "Stainless Steel",
        "Dimensions": "10x5x2 inches",
        "Weight": "2 lbs"
      },
      "features": ["Feature 1", "Feature 2"],
      "materials": ["Stainless Steel", "Rubber"],
      "dimensions": "10x5x2 inches",
      "weight": "2 lbs"
    }
  ],
  "confidence": 0.95
}

CRITICAL REQUIREMENTS:
- Extract EVERY piece of information available on the page
- Don't miss any downloadable files or attachments
- Get complete product specifications and features
- Capture all variants with individual pricing
- Ensure all image URLs are high-resolution
- Include detailed product descriptions
- Note any safety information or warnings

Focus on completeness and accuracy. This will become the master product database.
`;

/**
 * Scrape a single product page with enhanced data extraction
 */
async function scrapeProductPageEnhanced(productUrl: string, retryCount = 0): Promise<LuckySupplyProduct | null> {
  const maxRetries = 2;
  
  console.log(`🔥 Scraping product: ${productUrl}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  try {
    const startTime = Date.now();
    
    // Use FireCrawl with enhanced extraction
    const scrapeResponse = await firecrawlApp.scrapeUrl(productUrl, {
      formats: ['extract'],
      extract: {
        prompt: ENHANCED_PRODUCT_EXTRACTION_PROMPT,
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
                  attachments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        name: { type: 'string' },
                        url: { type: 'string' },
                        description: { type: 'string' }
                      }
                    }
                  },
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
                  },
                  specifications: { type: 'object' },
                  features: { type: 'array', items: { type: 'string' } },
                  materials: { type: 'array', items: { type: 'string' } },
                  dimensions: { type: 'string' },
                  weight: { type: 'string' }
                }
              }
            },
            confidence: { type: 'number' }
          }
        }
      },
      timeout: 60000 // 60 second timeout
    });

    const processingTime = Date.now() - startTime;
    
    if (!scrapeResponse.success || !scrapeResponse.extract) {
      if (retryCount < maxRetries && scrapeResponse.error?.includes('timeout')) {
        console.log(`⏳ Timeout occurred, retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return scrapeProductPageEnhanced(productUrl, retryCount + 1);
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
    
    // Add metadata and ensure required fields
    const luckyProduct: LuckySupplyProduct = {
      handle: product.handle || productUrl.split('/').pop() || '',
      sku: product.sku || `LS-${Date.now()}`,
      name: product.name || 'Unknown Product',
      description: product.description || '',
      brand: 'Lucky Supply',
      category: product.category || 'Uncategorized',
      price: product.price || 0,
      compare_at_price: product.compare_at_price,
      in_stock: product.in_stock ?? true,
      stock_quantity: product.stock_quantity,
      images: Array.isArray(product.images) ? product.images : [],
      attachments: Array.isArray(product.attachments) ? product.attachments : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      specifications: product.specifications || {},
      features: Array.isArray(product.features) ? product.features : [],
      materials: Array.isArray(product.materials) ? product.materials : [],
      dimensions: product.dimensions,
      weight: product.weight,
      source_url: productUrl,
      firecrawl_confidence: extractedData.confidence || 0.8,
      scraped_at: new Date().toISOString()
    };

    console.log(`✅ Scraped: ${luckyProduct.name} | Images: ${luckyProduct.images.length} | Attachments: ${luckyProduct.attachments.length} | Variants: ${luckyProduct.variants.length} (${processingTime}ms)`);
    return luckyProduct;
    
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`🔄 Error occurred, retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return scrapeProductPageEnhanced(productUrl, retryCount + 1);
    }
    
    console.error(`❌ Error scraping ${productUrl}:`, error.message);
    return null;
  }
}

/**
 * Scrape all Lucky Supply products with progress tracking
 */
async function scrapeAllLuckySupplyProducts(): Promise<ScrapingResult> {
  console.log(`🚀 Starting COMPLETE Lucky Supply scraping with FireCrawl...`);
  
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
    const errors: string[] = [];
    
    // Process in smaller batches to be respectful to the server
    const batchSize = 3; // Reduced batch size for better reliability
    const totalBatches = Math.ceil(productUrls.length / batchSize);
    
    console.log(`📦 Processing ${productUrls.length} products in ${totalBatches} batches of ${batchSize}`);
    console.log(`⏱️ Estimated time: ${Math.round((productUrls.length * 15) / 60)} minutes\n`);
    
    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (Products ${i + 1}-${Math.min(i + batchSize, productUrls.length)})`);
      
      // Process batch with controlled concurrency
      const batchPromises = batch.map(url => scrapeProductPageEnhanced(url));
      const batchResults = await Promise.all(batchPromises);
      
      let batchSuccessCount = 0;
      for (const result of batchResults) {
        if (result) {
          products.push(result);
          batchSuccessCount++;
        }
      }
      
      console.log(`✅ Batch ${batchNum} complete: ${batchSuccessCount}/${batch.length} products scraped`);
      console.log(`📊 Total progress: ${products.length}/${productUrls.length} products (${Math.round((products.length / productUrls.length) * 100)}%)`);
      
      // Save intermediate results every 10 batches
      if (batchNum % 10 === 0) {
        const outputDir = path.join(process.cwd(), 'data');
        await fs.mkdir(outputDir, { recursive: true });
        const checkpointPath = path.join(outputDir, `lucky-supply-checkpoint-${batchNum}.json`);
        await fs.writeFile(checkpointPath, JSON.stringify(products, null, 2));
        console.log(`💾 Checkpoint saved: ${checkpointPath}`);
      }
      
      // Delay between batches to be respectful
      if (i + batchSize < productUrls.length) {
        console.log('⏳ Waiting 5 seconds between batches...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Calculate summary statistics
    const totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
    const totalAttachments = products.reduce((sum, p) => sum + p.attachments.length, 0);
    const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
    const avgConfidence = products.reduce((sum, p) => sum + p.firecrawl_confidence, 0) / products.length;
    
    const result: ScrapingResult = {
      success: products.length > 0,
      products,
      total_products_attempted: productUrls.length,
      total_products_scraped: products.length,
      processing_time_ms: processingTime,
      errors,
      summary: {
        success_rate: (products.length / productUrls.length) * 100,
        avg_confidence: avgConfidence,
        total_images: totalImages,
        total_attachments: totalAttachments,
        total_variants: totalVariants
      }
    };
    
    console.log(`\n🏁 COMPLETE SCRAPING FINISHED!`);
    console.log(`✅ Successfully scraped: ${products.length}/${productUrls.length} products (${result.summary.success_rate.toFixed(1)}%)`);
    console.log(`🖼️ Total images: ${totalImages}`);
    console.log(`📎 Total attachments: ${totalAttachments}`);
    console.log(`🎯 Total variants: ${totalVariants}`);
    console.log(`⏱️ Total time: ${Math.round(processingTime / 1000 / 60)} minutes`);
    console.log(`🎯 Average confidence: ${avgConfidence.toFixed(2)}`);
    
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
    console.log('🎯 Lucky Supply Complete Product Scraper');
    console.log('This will scrape ALL products including attachments and specifications\n');
    
    // Run the complete scraping
    const result = await scrapeAllLuckySupplyProducts();
    
    // Save the complete results
    const outputDir = path.join(process.cwd(), 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'lucky-supply-complete.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\n💾 Complete results saved to: ${outputPath}`);
    
    // Save products in Supabase format for easy import
    const supabaseProducts = result.products.map(product => ({
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
    
    // Show final summary
    console.log('\n📈 FINAL SUMMARY:');
    console.log(`• Products scraped: ${result.total_products_scraped}`);
    console.log(`• Success rate: ${result.summary.success_rate.toFixed(1)}%`);
    console.log(`• Total images: ${result.summary.total_images}`);
    console.log(`• Total attachments: ${result.summary.total_attachments}`);
    console.log(`• Total variants: ${result.summary.total_variants}`);
    console.log(`• Average confidence: ${result.summary.avg_confidence.toFixed(2)}`);
    console.log(`• Processing time: ${Math.round(result.processing_time_ms / 1000 / 60)} minutes`);
    
    if (result.summary.total_attachments > 0) {
      console.log('\n📎 Sample attachments found:');
      const sampleProduct = result.products.find(p => p.attachments.length > 0);
      if (sampleProduct) {
        sampleProduct.attachments.slice(0, 3).forEach(att => {
          console.log(`  • ${att.name} (${att.type}): ${att.url}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Complete scraping failed:', error);
    
    if (error.message.includes('FIRECRAWL_API_KEY')) {
      console.log('\n🔑 FireCrawl API key issue detected');
      console.log('Make sure FIRECRAWL_API_KEY is set in your .env.local file');
    }
    
    process.exit(1);
  }
}

// Run the complete scraper
if (import.meta.main) {
  main();
}