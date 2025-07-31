#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'
import https from 'https'
import { URL } from 'url'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to download image from URL
async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url)
      https.get({
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (response) => {
        if (response.statusCode !== 200) {
          console.warn(`Failed to download ${url}: ${response.statusCode}`)
          resolve(null)
          return
        }

        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
        response.on('error', () => resolve(null))
      }).on('error', () => resolve(null))
    } catch (error) {
      console.warn(`Invalid URL: ${url}`)
      resolve(null)
    }
  })
}

// Function to extract image filename from URL
function getImageFilename(url: string, sku: string, index: number): string {
  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    // If filename has no extension or is generic, use SKU
    if (!filename || !filename.includes('.')) {
      return `${sku}_${index}.jpg`
    }
    
    // Prefix with SKU to ensure uniqueness
    return `${sku}_${filename}`
  } catch {
    return `${sku}_${index}.jpg`
  }
}

// Function to upload image to Supabase Storage
async function uploadToSupabase(buffer: Buffer, filename: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`Failed to upload ${filename}:`, error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)

    return publicUrl
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error)
    return null
  }
}

// Function to process safety documents (PDFs)
async function processSafetyDocs(product: any): Promise<string[]> {
  const safetyDocs: string[] = []
  
  // Check for safety data sheet or other document URLs in product data
  const docFields = ['safety_data_sheet', 'documentation', 'sds_url', 'pdf_url']
  
  for (const field of docFields) {
    if (product[field]) {
      const docUrl = product[field]
      const docBuffer = await downloadImage(docUrl) // Works for PDFs too
      
      if (docBuffer) {
        const filename = `docs/${product.sku}_${field}.pdf`
        const uploadedUrl = await uploadToSupabase(docBuffer, filename)
        if (uploadedUrl) {
          safetyDocs.push(uploadedUrl)
        }
      }
    }
  }
  
  return safetyDocs
}

// Main function to setup storage and process images
async function setupProductImages() {
  try {
    console.log('🚀 Setting up Supabase storage bucket for product images...\n')

    // Create storage bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Failed to list buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'product-images')
    
    if (!bucketExists) {
      console.log('📦 Creating product-images bucket...')
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
      })

      if (createError) {
        console.error('Failed to create bucket:', createError)
        return
      }
      console.log('✅ Bucket created successfully!\n')
    } else {
      console.log('✅ Bucket already exists\n')
    }

    // Read products from CSV
    const csvPath = path.join(process.cwd(), 'public/assets/shopify_formatted_products_cleaned.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    const products = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log(`📊 Found ${products.length} products to process\n`)

    // Process products in batches
    const batchSize = 10
    let processedCount = 0
    let uploadedCount = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`)
      
      await Promise.all(batch.map(async (product: any) => {
        const sku = product['SKU'] || product['Variant SKU']
        const imageUrls = []
        
        // Collect all possible image URLs
        if (product['Image Src']) {
          imageUrls.push(product['Image Src'])
        }
        
        // Check for additional image columns
        for (let j = 1; j <= 5; j++) {
          if (product[`Image ${j}`]) {
            imageUrls.push(product[`Image ${j}`])
          }
        }

        const uploadedUrls: string[] = []
        
        // Download and upload each image
        for (let index = 0; index < imageUrls.length; index++) {
          const imageUrl = imageUrls[index]
          if (!imageUrl || imageUrl === 'N/A') continue
          
          console.log(`  📥 Downloading image for ${sku}...`)
          const imageBuffer = await downloadImage(imageUrl)
          
          if (imageBuffer) {
            const filename = getImageFilename(imageUrl, sku, index)
            const uploadedUrl = await uploadToSupabase(imageBuffer, filename)
            
            if (uploadedUrl) {
              uploadedUrls.push(uploadedUrl)
              uploadedCount++
              console.log(`  ✅ Uploaded: ${filename}`)
            }
          }
        }

        // Process safety documents
        const safetyDocs = await processSafetyDocs(product)
        
        // Update product in database with new image URLs
        if (uploadedUrls.length > 0 || safetyDocs.length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              images: uploadedUrls,
              attachments: safetyDocs
            })
            .eq('sku', sku)
          
          if (updateError) {
            console.error(`  ❌ Failed to update product ${sku}:`, updateError)
          }
        }
        
        processedCount++
      }))
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Processing complete!`)
    console.log(`📊 Processed: ${processedCount} products`)
    console.log(`🖼️  Uploaded: ${uploadedCount} images`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the setup
setupProductImages()