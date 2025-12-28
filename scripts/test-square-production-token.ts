/**
 * Test Square Production Token Validity
 *
 * This script tests if your Square production access token is valid
 * and has the necessary permissions for customer operations.
 */

const SQUARE_API_VERSION = '2025-10-16'

async function testSquareToken() {
  const accessToken = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN
  const locationId = process.env.SQUARE_PRODUCTION_LOCATION_ID

  if (!accessToken) {
    console.error('❌ SQUARE_PRODUCTION_ACCESS_TOKEN is not set')
    process.exit(1)
  }

  if (!locationId) {
    console.error('❌ SQUARE_PRODUCTION_LOCATION_ID is not set')
    process.exit(1)
  }

  // Clean token
  const cleanToken = accessToken.trim()

  console.log('\n📋 Token Information:')
  console.log('-------------------')
  console.log(`Token length: ${cleanToken.length}`)
  console.log(`Token prefix: ${cleanToken.substring(0, 20)}`)
  console.log(`Token suffix: ${cleanToken.substring(cleanToken.length - 10)}`)
  console.log(`Has whitespace: ${/\s/.test(cleanToken) ? 'YES ❌' : 'NO ✅'}`)
  console.log(`Location ID: ${locationId}`)
  console.log()

  // Test 1: List Locations (minimal permission required)
  console.log('🧪 Test 1: List Locations')
  console.log('-------------------------')
  try {
    const response = await fetch('https://connect.squareup.com/v2/locations', {
      method: 'GET',
      headers: {
        'Square-Version': SQUARE_API_VERSION,
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to list locations')
      console.error(`Status: ${response.status}`)
      console.error('Response:', JSON.stringify(data, null, 2))

      if (response.status === 401) {
        console.error('\n⚠️  TOKEN IS INVALID OR EXPIRED')
        console.error('You need to regenerate your production access token from Square Dashboard.')
        process.exit(1)
      }
    } else {
      console.log('✅ Locations API works')
      console.log(`Found ${data.locations?.length || 0} locations`)
      if (data.locations) {
        data.locations.forEach((loc: Record<string, unknown>) => {
          console.log(`  - ${loc.name} (${loc.id})`)
        })
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    process.exit(1)
  }

  console.log()

  // Test 2: Search Customers (requires CUSTOMERS_READ)
  console.log('🧪 Test 2: Search Customers')
  console.log('---------------------------')
  try {
    const response = await fetch('https://connect.squareup.com/v2/customers/search', {
      method: 'POST',
      headers: {
        'Square-Version': SQUARE_API_VERSION,
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 1,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to search customers')
      console.error(`Status: ${response.status}`)
      console.error('Response:', JSON.stringify(data, null, 2))

      if (response.status === 401) {
        console.error('\n⚠️  TOKEN LACKS CUSTOMERS_READ PERMISSION')
        console.error(
          'Your access token needs the CUSTOMERS_READ and CUSTOMERS_WRITE OAuth scopes.'
        )
        console.error('\nHow to fix:')
        console.error('1. Go to https://developer.squareup.com/apps')
        console.error('2. Select your application')
        console.error('3. Go to OAuth tab')
        console.error('4. Ensure CUSTOMERS_READ and CUSTOMERS_WRITE are enabled')
        console.error('5. Generate a new Production Access Token')
        console.error('6. Update SQUARE_PRODUCTION_ACCESS_TOKEN in Vercel')
        process.exit(1)
      }
    } else {
      console.log('✅ Customers API works')
      console.log(`Found ${data.customers?.length || 0} customers (showing max 1)`)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    process.exit(1)
  }

  console.log()

  // Test 3: Create Order (requires ORDERS_WRITE)
  console.log('🧪 Test 3: Create Test Order')
  console.log('----------------------------')
  try {
    const response = await fetch('https://connect.squareup.com/v2/orders', {
      method: 'POST',
      headers: {
        'Square-Version': SQUARE_API_VERSION,
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: `test-${Date.now()}`,
        order: {
          location_id: locationId,
          line_items: [
            {
              name: 'Test Item',
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

    if (!response.ok) {
      console.error('❌ Failed to create order')
      console.error(`Status: ${response.status}`)
      console.error('Response:', JSON.stringify(data, null, 2))

      if (response.status === 401) {
        console.error('\n⚠️  TOKEN LACKS ORDERS_WRITE PERMISSION')
        console.error('Your access token needs the ORDERS_WRITE OAuth scope.')
      }
    } else {
      console.log('✅ Orders API works')
      console.log(`Created test order: ${data.order?.id}`)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
  }

  console.log()
  console.log('✅ All tests completed!')
  console.log()
  console.log('📚 Next Steps:')
  console.log('-------------')
  console.log('1. If any test failed with 401, regenerate your production token')
  console.log('2. Ensure your token has these OAuth scopes:')
  console.log('   - CUSTOMERS_READ')
  console.log('   - CUSTOMERS_WRITE')
  console.log('   - ORDERS_READ')
  console.log('   - ORDERS_WRITE')
  console.log('   - PAYMENTS_WRITE')
  console.log('3. Update your Vercel environment variables:')
  console.log('   vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production')
  console.log()
}

testSquareToken().catch(console.error)
