#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read production database URL from .env.production.local
const envPath = path.join(__dirname, '../.env.production.local')
const envContent = await fs.readFile(envPath, 'utf-8')
const dbUrl = envContent.match(/POSTGRES_URL_NON_POOLING="(.+?)"/)?.[1]

if (!dbUrl) {
  console.error('Could not find POSTGRES_URL_NON_POOLING in .env.production.local')
  process.exit(1)
}

console.log('Connecting to production database...')
const client = new pg.Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

try {
  await client.connect()
  console.log('✅ Connected to production database')

  // Get list of migration files
  const migrationsDir = path.join(__dirname, '../supabase/migrations')
  const files = await fs.readdir(migrationsDir)
  const migrationFiles = files.filter(file => file.endsWith('.sql')).sort()

  console.log(`Found ${migrationFiles.length} migration files`)

  // Check which migrations have already been applied
  const { rows: appliedMigrations } = await client
    .query(
      `
    SELECT name FROM supabase_migrations.schema_migrations 
    WHERE name LIKE '2025083%'
    ORDER BY name
  `
    )
    .catch(() => ({ rows: [] }))

  const appliedSet = new Set(appliedMigrations.map(row => row.name))

  // Apply new migrations
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, '.sql')

    // Skip migrations from August 30, 2025 that are already applied
    if (appliedSet.has(migrationName)) {
      console.log(`⏭️  Skipping already applied migration: ${migrationName}`)
      continue
    }

    // Only apply our new migrations (August 30, 2025)
    if (!migrationName.startsWith('20250830')) {
      console.log(`⏭️  Skipping older migration: ${migrationName}`)
      continue
    }

    console.log(`🔄 Applying migration: ${migrationName}`)

    const migrationPath = path.join(migrationsDir, file)
    const sql = await fs.readFile(migrationPath, 'utf-8')

    try {
      await client.query('BEGIN')
      await client.query(sql)

      // Record the migration as applied
      await client.query(
        `
        INSERT INTO supabase_migrations.schema_migrations (name, statements, checksum) 
        VALUES ($1, ARRAY[$2], $3)
      `,
        [migrationName, sql, 'applied-by-script']
      )

      await client.query('COMMIT')
      console.log(`✅ Successfully applied: ${migrationName}`)
    } catch (error) {
      await client.query('ROLLBACK')
      console.error(`❌ Failed to apply migration ${migrationName}:`, error.message)

      // Continue with other migrations instead of failing completely
      continue
    }
  }

  console.log('✅ Migration deployment complete!')
} catch (error) {
  console.error('❌ Database error:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
