# Production Deployment Guide

## Prerequisites

1. **Supabase Production Project**: You need a Supabase project at https://yzpiadsnllrycdfxlneb.supabase.co

2. **Correct Service Role Key**: The current service role key in `.env.production.local` seems to be invalid or expired.

## Steps to Deploy Products to Production

### 1. Get Fresh Service Role Key

1. Go to: https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/settings/api
2. Copy the **service_role** key (not the anon key)
3. Update `.env.production.local` with:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
   ```

### 2. Create Database Schema

1. Go to: https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/sql/new
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL in the Supabase SQL editor
4. This will create all necessary tables with proper structure

### 3. Import Products

Once the schema is created and you have the correct service role key:

```bash
# Import all 228 Lucky Supply products to production
bun run import:production
```

This will:
- Prompt for confirmation (type "yes")
- Import products in batches of 50
- Show progress for each batch
- Verify the import was successful

### 4. Verify Production Deployment

Run the production verification tests:

```bash
bun run test:production
```

This will verify:
- All 228 products are in the database
- Product categories are correct
- Key products exist
- Search functionality works

### 5. Manual Verification

You can also verify in the Supabase dashboard:
1. Go to: https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/editor
2. Navigate to the `products` table
3. You should see all 228 products

## Troubleshooting

### Invalid API Key Error
- Make sure you're using the **service_role** key, not the anon key
- The key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- Check that the key hasn't been regenerated in the Supabase dashboard

### Products Table Doesn't Exist
- Run the schema SQL from step 2
- Make sure all CREATE TABLE statements executed successfully

### Import Fails
- Check the Supabase dashboard logs for any errors
- Ensure your project hasn't hit any rate limits
- Try importing in smaller batches by modifying the batchSize in the import script

## Data Overview

The import includes 228 products:
- Medical Supplies and Sterilization Equipment: 219 products
- Tattoo Parts: 3 products
- Art and stencil supplies: 5 products
- Tattoo Shop Furniture and Supplies: 1 product

Each product has:
- SKU (unique identifier)
- Name
- Description
- Price
- Category
- Brand
- Stock status
- Tags array
- Images array