#!/usr/bin/env bun

/**
 * Test script for Square Customer Sync functionality
 * Run with: bun run scripts/test-customer-sync.ts
 */

import { SquareCustomerSyncService } from '../lib/services/square-customer-sync'
import { createClient } from '@supabase/supabase-js'

async function main() {
  console.log('🔄 Testing Square Customer Sync functionality...\n')

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Initialize sync service
    const syncService = new SquareCustomerSyncService(supabase)

    // Test 1: Check sync status
    console.log('📊 Checking current sync status...')
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/square/customers/sync`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const status = await response.json()
        console.log('✅ Sync status retrieved:', {
          linkedCustomers: status.stats.linkedCustomers,
          unlinkedUsers: status.stats.unlinkedUsers,
          lastSync: status.stats.lastSync,
          lastSyncStatus: status.stats.lastSyncStatus,
        })
      } else {
        console.log('❌ Failed to get sync status:', response.status)
      }
    } catch (error) {
      console.log('⚠️  API not available (normal in development):', error.message)
    }

    // Test 2: Run manual sync
    console.log('\n🔄 Running manual customer sync...')
    const result = await syncService.syncCustomers('manual')

    console.log('✅ Sync completed:', {
      success: result.success,
      customersCreated: result.customersCreated,
      customersUpdated: result.customersUpdated,
      customersMatched: result.customersMatched,
      customersFailed: result.customersFailed,
      errorsCount: result.errors.length,
    })

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.email || 'Unknown'}: ${error.error}`)
      })
    }

    // Test 3: Check database tables
    console.log('\n📊 Checking database tables...')

    // Check square_customers table
    const { data: customers, error: customersError } = await supabase
      .from('square_customers')
      .select('id, email, sync_status, last_synced_at')
      .limit(5)

    if (customersError) {
      console.log('❌ Error querying square_customers:', customersError.message)
    } else {
      console.log(`✅ Square customers table: ${customers?.length || 0} records`)
      customers?.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.email} (${customer.sync_status})`)
      })
    }

    // Check sync logs
    const { data: logs, error: logsError } = await supabase
      .from('square_customer_sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(3)

    if (logsError) {
      console.log('❌ Error querying sync logs:', logsError.message)
    } else {
      console.log(`\n📝 Recent sync logs: ${logs?.length || 0} records`)
      logs?.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.sync_type} - ${log.status} (${log.started_at})`)
        if (log.customers_created || log.customers_updated || log.customers_matched) {
          console.log(
            `     Created: ${log.customers_created}, Updated: ${log.customers_updated}, Matched: ${log.customers_matched}`
          )
        }
      })
    }

    // Test 4: Check unlinked users
    const { data: unlinked, error: unlinkedError } = await supabase
      .from('unlinked_supabase_users')
      .select('*')
      .limit(5)

    if (unlinkedError) {
      console.log('❌ Error querying unlinked users:', unlinkedError.message)
    } else {
      console.log(`\n👥 Unlinked Supabase users: ${unlinked?.length || 0} records`)
      unlinked?.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.user_created_at})`)
      })
    }

    console.log('\n✅ Customer sync test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (import.meta.main) {
  main()
}
