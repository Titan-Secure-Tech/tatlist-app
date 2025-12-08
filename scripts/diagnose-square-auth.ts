#!/usr/bin/env bun

/**
 * Diagnose Square Authentication Issues
 *
 * This script tests:
 * 1. Environment variable format
 * 2. Token validity with direct API call
 * 3. SDK initialization
 * 4. OAuth scopes
 */

import { SquareClient, SquareEnvironment } from 'square'

const TOKEN = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN
const APP_ID = process.env.SQUARE_PRODUCTION_APPLICATION_ID
const LOCATION_ID = process.env.SQUARE_PRODUCTION_LOCATION_ID

console.log('=== Square Authentication Diagnosis ===\n')

// 1. Check environment variables
console.log('1. Environment Variables:')
console.log(`   Token length: ${TOKEN?.length || 0} characters`)
console.log(`   Token starts with: ${TOKEN?.substring(0, 20)}...`)
console.log(`   Token ends with: ...${TOKEN?.substring(TOKEN.length - 10)}`)
console.log(`   App ID: ${APP_ID}`)
console.log(`   Location ID: ${LOCATION_ID}`)
console.log(
  `   Has whitespace: ${TOKEN?.includes('\\n') || TOKEN?.includes('\\r') || TOKEN?.includes(' ') ? '❌ YES' : '✅ NO'}`
)
console.log('')

// 2. Test with fetch (raw HTTP like curl)
console.log('2. Testing with fetch (raw HTTP):')
try {
  const response = await fetch('https://connect.squareup.com/v2/orders', {
    method: 'POST',
    headers: {
      'Square-Version': '2025-10-16',
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotency_key: `test-${Date.now()}`,
      order: {
        location_id: LOCATION_ID,
        line_items: [
          {
            name: 'Test Product',
            quantity: '1',
            base_price_money: {
              amount: 100,
              currency: 'USD',
            },
          },
        ],
      },
    }),
  })

  const data = await response.json()

  if (response.ok) {
    console.log(`   ✅ SUCCESS - Order created: ${data.order?.id}`)
  } else {
    console.log(`   ❌ FAILED - ${response.status} ${response.statusText}`)
    console.log(`   Error: ${JSON.stringify(data, null, 2)}`)
  }
} catch (error) {
  console.log(`   ❌ EXCEPTION: ${error}`)
}
console.log('')

// 3. Test with Square SDK
console.log('3. Testing with Square SDK:')
try {
  const client = new SquareClient({
    accessToken: TOKEN,
    environment: SquareEnvironment.Production,
    squareVersion: '2025-10-16',
  })

  const orderResponse = await client.orders.create({
    idempotencyKey: `test-sdk-${Date.now()}`,
    order: {
      locationId: LOCATION_ID!,
      lineItems: [
        {
          name: 'Test Product SDK',
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(100),
            currency: 'USD',
          },
        },
      ],
    },
  })

  console.log(`   ✅ SUCCESS - Order created: ${orderResponse.result.order?.id}`)
} catch (error) {
  console.log(`   ❌ FAILED`)
  const err = error as { message?: string; statusCode?: number; errors?: unknown[] }
  console.log(`   Error: ${err.message}`)
  if (err.statusCode) {
    console.log(`   Status Code: ${err.statusCode}`)
  }
  if (err.errors) {
    console.log(`   Errors: ${JSON.stringify(err.errors, null, 2)}`)
  }
}
console.log('')

// 4. Check OAuth scopes (requires a successful connection)
console.log('4. OAuth Scope Check:')
console.log('   To verify OAuth scopes:')
console.log('   1. Go to https://developer.squareup.com/apps')
console.log('   2. Select your application')
console.log('   3. Go to OAuth → Scopes')
console.log('   4. Ensure these are checked:')
console.log('      - CUSTOMERS_READ')
console.log('      - CUSTOMERS_WRITE')
console.log('      - ORDERS_READ')
console.log('      - ORDERS_WRITE')
console.log('      - PAYMENTS_READ')
console.log('      - PAYMENTS_WRITE')
console.log('')

console.log('=== Diagnosis Complete ===')
