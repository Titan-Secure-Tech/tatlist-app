#!/usr/bin/env bun

/**
 * Test Square credentials to verify Access Token works with Location ID
 * This will help debug the 401 UNAUTHORIZED errors
 */

import { SquareClient, SquareEnvironment } from 'square'

const ACCESS_TOKEN = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN
const APPLICATION_ID = process.env.SQUARE_PRODUCTION_APPLICATION_ID
const LOCATION_ID = process.env.SQUARE_PRODUCTION_LOCATION_ID

console.log('\n🔍 Testing Square Production Credentials...\n')
console.log('=' .repeat(60))

// Show credential info (masked)
console.log('Credentials loaded:')
console.log(`  Access Token: ${ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 10)}...${ACCESS_TOKEN.substring(ACCESS_TOKEN.length - 4)}` : 'MISSING'}`)
console.log(`  Application ID: ${APPLICATION_ID || 'MISSING'}`)
console.log(`  Location ID: ${LOCATION_ID || 'MISSING'}`)
console.log('=' .repeat(60))

if (!ACCESS_TOKEN || !APPLICATION_ID || !LOCATION_ID) {
  console.error('\n❌ ERROR: Missing required environment variables')
  console.error('Make sure these are set in .env.production.local:')
  console.error('  - SQUARE_PRODUCTION_ACCESS_TOKEN')
  console.error('  - SQUARE_PRODUCTION_APPLICATION_ID')
  console.error('  - SQUARE_PRODUCTION_LOCATION_ID\n')
  process.exit(1)
}

// Create Square client
const client = new SquareClient({
  accessToken: ACCESS_TOKEN,
  environment: SquareEnvironment.Production,
})

// Test 1: Get location details
console.log('\n📍 Test 1: Retrieving location details...')
try {
  const response = await client.locations.retrieveLocation(LOCATION_ID)
  const location = response.result.location

  console.log('✅ SUCCESS - Location retrieved:')
  console.log(`  Name: ${location?.name}`)
  console.log(`  ID: ${location?.id}`)
  console.log(`  Address: ${location?.address?.addressLine1}, ${location?.address?.locality}`)
  console.log(`  Status: ${location?.status}`)
  console.log(`  Business Name: ${location?.businessName}`)
} catch (error: any) {
  console.error('❌ FAILED - Could not retrieve location')
  console.error(`  Error: ${error.message}`)
  if (error.statusCode) {
    console.error(`  Status Code: ${error.statusCode}`)
  }
  if (error.errors) {
    console.error(`  Details: ${JSON.stringify(error.errors, null, 2)}`)
  }
}

// Test 2: List all locations (to verify access)
console.log('\n📋 Test 2: Listing all locations for this account...')
try {
  const response = await client.locations.listLocations()
  const locations = response.result.locations || []

  console.log(`✅ SUCCESS - Found ${locations.length} location(s):`)
  locations.forEach((loc, index) => {
    console.log(`\n  Location ${index + 1}:`)
    console.log(`    Name: ${loc.name}`)
    console.log(`    ID: ${loc.id}`)
    console.log(`    Status: ${loc.status}`)

    if (loc.id === LOCATION_ID) {
      console.log(`    🎯 This is the configured location!`)
    }
  })

  // Check if configured location is in the list
  const hasConfiguredLocation = locations.some(loc => loc.id === LOCATION_ID)
  if (!hasConfiguredLocation) {
    console.log('\n⚠️  WARNING: Configured LOCATION_ID not found in account locations!')
    console.log('  This Access Token may not have access to this location.')
  }
} catch (error: any) {
  console.error('❌ FAILED - Could not list locations')
  console.error(`  Error: ${error.message}`)
  if (error.statusCode) {
    console.error(`  Status Code: ${error.statusCode}`)
  }
  if (error.errors) {
    console.error(`  Details: ${JSON.stringify(error.errors, null, 2)}`)
  }
}

// Test 3: Try to create a simple payment link
console.log('\n💳 Test 3: Testing payment link creation...')
try {
  const testOrder = {
    locationId: LOCATION_ID,
    lineItems: [
      {
        name: 'Test Product',
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(100), // $1.00
          currency: 'USD',
        },
      },
    ],
  }

  const paymentLinkResponse = await client.checkout.createPaymentLink({
    order: testOrder,
    checkoutOptions: {
      redirectUrl: 'https://tatlist.com/payment-success',
    },
  })

  const paymentLink = paymentLinkResponse.result.paymentLink

  console.log('✅ SUCCESS - Payment link created:')
  console.log(`  Payment Link ID: ${paymentLink?.id}`)
  console.log(`  URL: ${paymentLink?.url}`)
  console.log(`  Order ID: ${paymentLink?.orderId}`)

  console.log('\n🎉 All tests passed! Square credentials are working correctly.')
} catch (error: any) {
  console.error('❌ FAILED - Could not create payment link')
  console.error(`  Error: ${error.message}`)
  if (error.statusCode) {
    console.error(`  Status Code: ${error.statusCode}`)
  }
  if (error.errors) {
    console.error(`  Details: ${JSON.stringify(error.errors, null, 2)}`)
  }

  if (error.statusCode === 401) {
    console.log('\n🔴 401 UNAUTHORIZED Error Detected!')
    console.log('  Possible causes:')
    console.log('  1. Access Token is invalid or expired')
    console.log('  2. Access Token is for a different Square account')
    console.log('  3. Access Token lacks required permissions (PAYMENTS_WRITE, ORDERS_WRITE)')
    console.log('  4. Access Token is from sandbox but environment is set to production')
    console.log('\n  Next steps:')
    console.log('  1. Verify in Square Dashboard that this Access Token belongs to the production app')
    console.log('  2. Check that the Application ID matches the app that generated this token')
    console.log('  3. Ensure OAuth scopes include PAYMENTS_WRITE and ORDERS_WRITE')
  }
}

console.log('\n' + '='.repeat(60))
console.log('Test complete!\n')
