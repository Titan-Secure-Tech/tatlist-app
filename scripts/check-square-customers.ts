#!/usr/bin/env bun

/**
 * Check Square customers in Supabase database
 */

import { createClient } from '@supabase/supabase-js'

async function main() {
  console.log('📊 Checking Square customers in Supabase database...\n')

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if square_customers table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('square_customers')
      .select('count', { count: 'exact', head: true })

    if (tableError) {
      console.log('⚠️  Square customers table does not exist yet or migration not applied')
      console.log('   Error:', tableError.message)
      console.log("   This is expected if migrations haven't been applied to production yet.\n")

      // Check orders table for square_customer_id column
      const { data: orders } = await supabase
        .from('orders')
        .select('square_customer_id')
        .not('square_customer_id', 'is', null)
        .limit(5)

      if (orders && orders.length > 0) {
        console.log('✅ Found orders with Square customer IDs:', orders.length)
      } else {
        console.log('📝 No orders with Square customer IDs found')
      }
      return
    }

    // Get total count
    console.log(`✅ Total Square customers: ${tableExists || 0}`)

    // Get breakdown by sync status
    const { data: byStatus } = await supabase
      .from('square_customers')
      .select('sync_status, created_at')

    if (byStatus && byStatus.length > 0) {
      const statusCount = byStatus.reduce(
        (acc, customer) => {
          acc[customer.sync_status] = (acc[customer.sync_status] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      console.log('\n📈 Breakdown by sync status:')
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`)
      })

      // Show recent customers
      const { data: recent } = await supabase
        .from('square_customers')
        .select('email, sync_status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent && recent.length > 0) {
        console.log('\n🕒 Recent Square customers:')
        recent.forEach((customer, index) => {
          const date = new Date(customer.created_at).toLocaleDateString()
          console.log(`   ${index + 1}. ${customer.email} (${customer.sync_status}) - ${date}`)
        })
      }
    }

    // Check unlinked users
    const { data: unlinked, error: unlinkedError } = await supabase
      .from('unlinked_supabase_users')
      .select('*', { count: 'exact', head: true })

    if (!unlinkedError) {
      console.log(`\n👥 Unlinked Supabase users: ${unlinked || 0}`)
    }

    // Check sync logs
    const { data: logs } = await supabase
      .from('square_customer_sync_logs')
      .select('sync_type, status, customers_created, customers_matched, started_at')
      .order('started_at', { ascending: false })
      .limit(3)

    if (logs && logs.length > 0) {
      console.log('\n📝 Recent sync logs:')
      logs.forEach((log, index) => {
        const date = new Date(log.started_at).toLocaleString()
        console.log(`   ${index + 1}. ${log.sync_type} - ${log.status} (${date})`)
        if (log.customers_created || log.customers_matched) {
          console.log(`      Created: ${log.customers_created}, Matched: ${log.customers_matched}`)
        }
      })
    } else {
      console.log("\n📝 No sync logs found - sync hasn't run yet")
    }

    console.log('\n✅ Square customer check completed!')
  } catch (error) {
    console.error('❌ Check failed:', error)
    process.exit(1)
  }
}

// Run the check
if (import.meta.main) {
  main()
}
