#!/usr/bin/env bun

/**
 * Complete sync from local Supabase to production
 * Resets production database and copies all data from local
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Local Supabase (from supabase start)
const localSupabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Production Supabase
const productionSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TABLES_TO_SYNC = [
  'products',
  'profiles',
  // Add other tables as needed - keeping it simple for now
]

async function resetAndSyncDatabase() {
  try {
    console.log('🔄 Starting complete database sync from local to production...\n')

    // Step 1: Use known tables to sync
    console.log('📋 Tables to sync:', TABLES_TO_SYNC.join(', '))

    // Step 2: Clear production data for each table
    console.log('🗑️ Clearing production database tables...')
    for (const tableName of TABLES_TO_SYNC) {
      console.log(`  Clearing ${tableName}...`)
      const { error: deleteError } = await productionSupabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.warn(`  ⚠️ Warning clearing ${tableName}:`, deleteError.message)
      } else {
        console.log(`  ✅ Cleared ${tableName}`)
      }
    }

    // Step 3: Copy data from local to production for each table
    console.log('\n📤 Copying data from local to production...')
    let totalRecords = 0

    for (const tableName of TABLES_TO_SYNC) {
      console.log(`\n📋 Processing table: ${tableName}`)

      // Get all data from local table
      const { data: localData, error: fetchError } = await localSupabase.from(tableName).select('*')

      if (fetchError) {
        console.error(`❌ Error fetching from local ${tableName}:`, fetchError.message)
        continue
      }

      if (!localData || localData.length === 0) {
        console.log(`  ℹ️ No data found in local ${tableName}`)
        continue
      }

      console.log(`  📊 Found ${localData.length} records in local ${tableName}`)

      // Prepare data for insertion (remove id to let DB generate new ones if needed)
      const dataForInsert = localData.map(record => {
        // For some tables, keep the ID; for others, let the DB generate new ones
        if (['products', 'profiles'].includes(tableName)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...recordWithoutId } = record
          return {
            ...recordWithoutId,
            created_at: record.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        } else {
          return {
            ...record,
            created_at: record.created_at || new Date().toISOString(),
            updated_at: record.updated_at || new Date().toISOString(),
          }
        }
      })

      // Insert in batches
      const batchSize = 100
      let inserted = 0

      for (let i = 0; i < dataForInsert.length; i += batchSize) {
        const batch = dataForInsert.slice(i, i + batchSize)
        const batchNum = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(dataForInsert.length / batchSize)

        console.log(`    📦 Batch ${batchNum}/${totalBatches} (${batch.length} records)...`)

        const { error: insertError } = await productionSupabase.from(tableName).insert(batch)

        if (insertError) {
          console.error(`    ❌ Error inserting batch ${batchNum}:`, insertError.message)
        } else {
          inserted += batch.length
          console.log(`    ✅ Inserted ${batch.length} records`)
        }
      }

      console.log(`  🎉 ${tableName}: ${inserted}/${localData.length} records copied`)
      totalRecords += inserted
    }

    console.log(`\n🎊 Sync complete! Successfully synced ${totalRecords} total records`)
    console.log('📊 Summary:')
    console.log(`  • Tables synced: ${TABLES_TO_SYNC.length}`)
    console.log(`  • Total records: ${totalRecords}`)
    console.log(`  • Production database: Reset and updated`)
  } catch (error) {
    console.error('❌ Sync failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run the complete sync
resetAndSyncDatabase()
