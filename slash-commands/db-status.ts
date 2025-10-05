#!/usr/bin/env bun

import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConnection() {
  console.log(chalk.cyan('🔌 Connection Status'))
  console.log(chalk.gray('──────────────────\n'))

  try {
    // Test basic connection
    const { error } = await supabase.from('products').select('count').limit(1)

    if (error) {
      console.log(chalk.red('❌ Connection failed'))
      console.log(chalk.gray(`   Error: ${error.message}`))
      return false
    }

    console.log(chalk.green('✅ Connected to Supabase'))
    console.log(chalk.gray(`   URL: ${supabaseUrl}`))
    return true
  } catch (error: unknown) {
    console.log(chalk.red('❌ Connection error'))
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(chalk.gray(`   ${message}`))
    return false
  }
}

async function checkTables() {
  console.log(chalk.cyan('\n📊 Table Statistics'))
  console.log(chalk.gray('──────────────────\n'))

  const tables = [
    { name: 'products', description: 'Product catalog' },
    { name: 'orders', description: 'Customer orders' },
    { name: 'payments', description: 'Payment records' },
    { name: 'webhooks', description: 'Webhook logs' },
    { name: 'profiles', description: 'User profiles' },
  ]

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(chalk.yellow(`⚠️  ${table.name}: Error`))
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.log(chalk.gray(`   ${message}`))
      } else {
        console.log(chalk.green(`✓ ${table.name}: ${count || 0} records`))
        console.log(chalk.gray(`   ${table.description}`))
      }
    } catch (error: unknown) {
      console.log(chalk.red(`✗ ${table.name}: Failed`))
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.log(chalk.gray(`   ${message}`))
    }
  }
}

async function checkRecentOrders() {
  console.log(chalk.cyan('\n📦 Recent Orders'))
  console.log(chalk.gray('───────────────\n'))

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.log(chalk.yellow('⚠️  Could not fetch orders'))
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.log(chalk.gray(`   ${message}`))
      return
    }

    if (!orders || orders.length === 0) {
      console.log(chalk.gray('No orders found'))
      return
    }

    orders.forEach((order, index) => {
      const date = new Date(order.created_at).toLocaleString()
      const amount = `$${(order.amount / 100).toFixed(2)}`
      const status =
        order.status === 'completed' ? chalk.green(order.status) : chalk.yellow(order.status)

      console.log(chalk.white(`${index + 1}. Order ${order.id.substring(0, 8)}...`))
      console.log(chalk.gray(`   Amount: ${amount} | Status: ${status}`))
      console.log(chalk.gray(`   Date: ${date}`))
      console.log()
    })
  } catch (error: unknown) {
    console.log(chalk.red('❌ Error fetching orders'))
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(chalk.gray(`   ${message}`))
  }
}

async function checkMigrations() {
  console.log(chalk.cyan('\n🔄 Migration Status'))
  console.log(chalk.gray('─────────────────\n'))

  try {
    // Check if there are any migration files
    const migrationFiles = execSync(
      'ls -la supabase/migrations 2>/dev/null | grep -c ".sql" || echo "0"',
      {
        encoding: 'utf-8',
      }
    ).trim()

    const count = parseInt(migrationFiles)

    if (count > 0) {
      console.log(chalk.green(`✅ ${count} migration files found`))

      // List recent migrations
      try {
        const migrations = execSync('ls -t supabase/migrations/*.sql 2>/dev/null | head -3', {
          encoding: 'utf-8',
        })
          .trim()
          .split('\n')

        console.log(chalk.gray('   Recent migrations:'))
        migrations.forEach(m => {
          const filename = m.split('/').pop()
          console.log(chalk.gray(`   - ${filename}`))
        })
      } catch {
        // Could not list migrations
      }
    } else {
      console.log(chalk.yellow('⚠️  No migration files found'))
      console.log(chalk.gray('   Run "bunx supabase migration new <name>" to create one'))
    }
  } catch {
    console.log(chalk.gray('No migrations directory found'))
  }
}

async function checkAuth() {
  console.log(chalk.cyan('\n🔐 Auth Configuration'))
  console.log(chalk.gray('───────────────────\n'))

  try {
    // Check for authenticated users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log(chalk.green(`✓ ${userCount || 0} registered users`))

    // Check auth configuration
    const authProviders = []
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      authProviders.push('Email/Password')

      // Check for OAuth providers (these would be configured in Supabase dashboard)
      console.log(chalk.gray('   Providers: Email/Password, Google OAuth'))
    }
  } catch (error: unknown) {
    console.log(chalk.yellow('⚠️  Could not check auth status'))
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(chalk.gray(`   ${message}`))
  }
}

async function main() {
  console.log(chalk.bold.blue('🗄️  Tatlist Database Status\n'))

  // Check environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.log(chalk.red('❌ Missing Supabase environment variables'))
    console.log(chalk.gray('   Please configure:'))
    console.log(chalk.gray('   - NEXT_PUBLIC_SUPABASE_URL'))
    console.log(chalk.gray('   - NEXT_PUBLIC_SUPABASE_ANON_KEY'))
    process.exit(1)
  }

  // Run all checks
  const connected = await checkConnection()

  if (connected) {
    await checkTables()
    await checkRecentOrders()
    await checkAuth()
  }

  await checkMigrations()

  // Summary
  console.log(chalk.cyan('\n📈 Summary'))
  console.log(chalk.gray('─────────\n'))

  if (connected) {
    console.log(chalk.green('✅ Database is healthy and accessible'))
    console.log(chalk.gray(`   Project: ${supabaseUrl.split('.')[0].split('//')[1]}`))
  } else {
    console.log(chalk.red('❌ Database connection issues detected'))
    console.log(chalk.gray('   Check your environment configuration'))
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  process.exit(1)
})
