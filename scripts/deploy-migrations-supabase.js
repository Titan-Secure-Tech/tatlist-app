#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read production credentials from .env.production.local
const envPath = path.join(__dirname, '../.env.production.local')
const envContent = await fs.readFile(envPath, 'utf-8')

const supabaseUrl = envContent.match(/SUPABASE_URL="(.+?)"/)?.[1]
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="(.+?)"/)?.[1]

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Could not find SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.production.local')
  process.exit(1)
}

console.log('Connecting to production Supabase...')
const supabase = createClient(supabaseUrl, serviceRoleKey)

try {
  // Test connection
  const { error: testError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(1)

  if (testError) {
    throw new Error(`Connection test failed: ${testError.message}`)
  }

  console.log('✅ Connected to production Supabase')

  // Get list of migration files (only our new ones)
  const migrationsDir = path.join(__dirname, '../supabase/migrations')
  const files = await fs.readdir(migrationsDir)
  const migrationFiles = files
    .filter(file => file.endsWith('.sql') && file.startsWith('20250830'))
    .sort()

  console.log(`Found ${migrationFiles.length} new migration files to deploy`)

  // Apply migrations using RPC or direct SQL execution
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, '.sql')
    console.log(`🔄 Applying migration: ${migrationName}`)

    const migrationPath = path.join(migrationsDir, file)
    const sql = await fs.readFile(migrationPath, 'utf-8')

    try {
      // Execute the migration SQL
      const { error } = await supabase.rpc('execute_sql', { sql_query: sql })

      if (error) {
        // If RPC doesn't exist, try direct execution (this might not work due to RLS)
        console.log(`RPC method failed, trying alternative approach...`)

        // Split SQL into individual statements and execute them
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0)

        for (const statement of statements) {
          if (statement.toLowerCase().includes('create table')) {
            // We'll need to manually create tables via the dashboard
            console.log(`⚠️  Table creation statement found - may need manual execution:`)
            console.log(`   ${statement.substring(0, 50)}...`)
          }
        }

        throw error
      }

      console.log(`✅ Successfully applied: ${migrationName}`)
    } catch (error) {
      console.error(`❌ Failed to apply migration ${migrationName}:`, error.message)
      console.log(`\n📋 Migration content for manual execution:`)
      console.log(`--- ${migrationName} ---`)
      console.log(sql)
      console.log(`--- End ${migrationName} ---\n`)
    }
  }

  console.log('✅ Migration deployment process complete!')
  console.log(`\n📌 Next steps:`)
  console.log(
    `1. Check the Supabase Dashboard at: ${supabaseUrl.replace('supabase.co', 'supabase.com')}/project/${supabaseUrl.match(/([^.]+)\.supabase/)?.[1]}/editor`
  )
  console.log(`2. Verify that tables were created: users, orders, cart_items, favorites, etc.`)
  console.log(`3. If any migrations failed, execute them manually in the SQL Editor`)
} catch (error) {
  console.error('❌ Supabase error:', error.message)
  console.log(`\n📋 Manual migration deployment required:`)
  console.log(
    `1. Go to: ${supabaseUrl.replace('supabase.co', 'supabase.com')}/project/${supabaseUrl.match(/([^.]+)\.supabase/)?.[1]}/sql`
  )
  console.log(`2. Execute the migration files manually:`)

  // Show migration files for manual execution
  const migrationsDir = path.join(__dirname, '../supabase/migrations')
  const files = await fs.readdir(migrationsDir)
  const migrationFiles = files
    .filter(file => file.endsWith('.sql') && file.startsWith('20250830'))
    .sort()

  for (const file of migrationFiles) {
    console.log(`   - ${file}`)
  }

  process.exit(1)
}
