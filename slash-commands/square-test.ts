#!/usr/bin/env bun

import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const SQUARE_SANDBOX_URL = 'https://connect.squareupsandbox.com/v2'

interface TestResult {
  step: string
  success: boolean
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
}

const results: TestResult[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logResult(step: string, success: boolean, message: string, details?: any) {
  results.push({ step, success, message, details })

  const icon = success ? '✅' : '❌'
  const color = success ? chalk.green : chalk.red

  console.log(color(`${icon} ${step}`))
  console.log(chalk.gray(`   ${message}`))

  if (details && process.env.VERBOSE) {
    console.log(chalk.gray('   Details:'), details)
  }

  console.log()
}

async function testSquareConnection() {
  const step = 'Square API Connection'

  try {
    const response = await fetch(`${SQUARE_SANDBOX_URL}/locations`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      logResult(
        step,
        true,
        `Connected to Square Sandbox (${data.locations?.length || 0} locations)`,
        data.locations?.[0]
      )
    } else {
      const error = await response.text()
      logResult(step, false, `Square API returned ${response.status}`, error)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logResult(step, false, `Connection failed: ${message}`)
  }
}

async function testProductCatalog() {
  const step = 'Product Catalog'

  try {
    // Check Supabase for products
    const { data: products, error } = await supabase.from('products').select('*').limit(5)

    if (error) {
      logResult(step, false, `Database query failed: ${error.message}`)
    } else if (!products || products.length === 0) {
      logResult(step, false, 'No products found in database')
    } else {
      logResult(step, true, `Found ${products.length} products in database`, {
        sample: products[0].name,
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logResult(step, false, `Error: ${message}`)
  }
}

async function testOrderCreation() {
  const step = 'Order Creation'

  try {
    // Create a test order in the database
    const testOrder = {
      customer_email: 'test@tatlist.com',
      amount: 5000, // $50.00
      status: 'pending',
      square_order_id: `TEST_${Date.now()}`,
      metadata: {
        test: true,
        created_by: 'square-test-command',
      },
    }

    const { data: order, error } = await supabase.from('orders').insert(testOrder).select().single()

    if (error) {
      logResult(step, false, `Failed to create order: ${error.message}`)
    } else {
      logResult(step, true, `Created test order ${order.id}`, {
        id: order.id,
        amount: `$${(order.amount / 100).toFixed(2)}`,
      })

      // Clean up test order
      await supabase.from('orders').delete().eq('id', order.id)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logResult(step, false, `Error: ${message}`)
  }
}

async function testPaymentAPI() {
  const step = 'Payment Processing'

  try {
    // Create a test payment request
    const paymentRequest = {
      source_id: 'cnon:card-nonce-ok', // Square test nonce
      idempotency_key: `test_${Date.now()}`,
      amount_money: {
        amount: 100, // $1.00
        currency: 'USD',
      },
      location_id: process.env.SQUARE_SANDBOX_LOCATION_ID,
    }

    const response = await fetch(`${SQUARE_SANDBOX_URL}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    })

    const data = await response.json()

    if (response.ok && data.payment) {
      logResult(step, true, `Payment processed: ${data.payment.id}`, {
        status: data.payment.status,
        amount: `$${(data.payment.amount_money.amount / 100).toFixed(2)}`,
      })
    } else {
      logResult(
        step,
        false,
        `Payment failed: ${data.errors?.[0]?.detail || 'Unknown error'}`,
        data.errors
      )
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logResult(step, false, `Error: ${message}`)
  }
}

async function testWebhookEndpoint() {
  const step = 'Webhook Endpoint'

  try {
    // Test the webhook endpoint exists
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7500'}/api/webhooks/square`

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'payment.created',
        data: {
          object: {
            payment: {
              id: 'test-payment-id',
              status: 'COMPLETED',
            },
          },
        },
      }),
    })

    if (response.ok) {
      logResult(step, true, `Webhook endpoint responding at ${webhookUrl}`)
    } else {
      logResult(step, false, `Webhook returned ${response.status}`)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logResult(step, false, `Webhook unreachable: ${message}`)
  }
}

async function main() {
  console.log(chalk.bold.blue('💳 Square Integration Test Suite\n'))
  console.log(chalk.gray('Testing Square Sandbox integration...\n'))

  // Check required environment variables
  const required = [
    'SQUARE_SANDBOX_ACCESS_TOKEN',
    'SQUARE_SANDBOX_APPLICATION_ID',
    'SQUARE_SANDBOX_LOCATION_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.log(chalk.red('❌ Missing required environment variables:'))
    missing.forEach(key => console.log(chalk.yellow(`   - ${key}`)))
    console.log(chalk.gray('\nPlease configure these in your .env.local file'))
    process.exit(1)
  }

  // Run tests
  await testSquareConnection()
  await testProductCatalog()
  await testOrderCreation()
  await testPaymentAPI()
  await testWebhookEndpoint()

  // Summary
  console.log(chalk.bold('\n📊 Test Summary'))
  console.log(chalk.gray('──────────────\n'))

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const color = result.success ? chalk.green : chalk.red
    console.log(color(`${icon} ${result.step}`))
  })

  console.log()

  if (failed === 0) {
    console.log(chalk.bold.green(`🎉 All ${passed} tests passed!`))
  } else {
    console.log(chalk.yellow(`⚠️  ${passed} passed, ${failed} failed`))

    if (failed > 0) {
      console.log(chalk.gray('\nFailed tests:'))
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(chalk.red(`  - ${r.step}: ${r.message}`))
        })
    }
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  process.exit(1)
})
