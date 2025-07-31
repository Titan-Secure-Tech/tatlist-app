# Product Images Setup Guide

This guide explains how to set up and manage product images in the Tatlist application using Supabase Storage.

## Overview

We have three scripts to handle product images:

1. **setup-product-images.ts** - Downloads images from URLs in CSV and uploads to Supabase
2. **scrape-lucky-images.ts** - Scrapes Lucky Supply website for product images using Puppeteer
3. **Database migrations** - Adds support for images and attachments

## Prerequisites

1. Ensure you have the following environment variables set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the latest migrations to add the attachments and source_url columns:
   ```bash
   bunx supabase db push
   ```

## Usage

### Option 1: Upload from CSV URLs (if available)

If your CSV file contains image URLs:

```bash
bun run scripts/setup-product-images.ts
```

This script will:
- Create a `product-images` bucket in Supabase Storage (if not exists)
- Download images from URLs in the CSV
- Upload them to Supabase Storage
- Update product records with the new image URLs
- Also process any PDF attachments (safety sheets, etc.)

### Option 2: Scrape from Lucky Supply Website

If you need to fetch images directly from Lucky Supply:

```bash
bun run scripts/scrape-lucky-images.ts
```

This script will:
- Query products without images from the database
- Search for each product on Lucky Supply website
- Extract the main product image
- Upload to Supabase Storage
- Update product records with image URLs and source links

**Note**: This script processes products slowly to avoid rate limiting. It includes a 2-second delay between products.

## Storage Structure

Images are stored in Supabase Storage with the following structure:
```
product-images/
├── SKU_main.jpg           # Main product images
├── SKU_0.jpg              # Additional images
├── SKU_1.jpg
└── docs/
    └── SKU_safety_data_sheet.pdf  # Safety documents
```

## Database Schema

Products table includes:
- `images` (text[]) - Array of image URLs from Supabase Storage
- `attachments` (text[]) - Array of document URLs (PDFs, etc.)
- `source_url` (text) - Original product page URL from Lucky Supply

## Viewing Images

Images are displayed in:
- Product cards on the `/products` page
- Product detail pages at `/products/[id]`
- Shopping cart items

The components handle missing images gracefully with placeholder icons.

## Troubleshooting

### Images not displaying
1. Check if the bucket is public in Supabase dashboard
2. Verify the image URLs are correctly stored in the database
3. Check browser console for CORS errors

### Scraping issues
1. Ensure you have puppeteer installed: `bun add puppeteer`
2. The scraper may need updates if Lucky Supply changes their website structure
3. Try reducing batch size if you get rate limited

### Upload failures
1. Check your Supabase storage quota
2. Verify the service role key has proper permissions
3. Check file size limits (default is 50MB per file)

## Manual Image Upload

You can also manually upload images through Supabase dashboard:
1. Go to Storage > product-images bucket
2. Upload images with filename format: `SKU_main.jpg`
3. Update the product's `images` array in the database