/**
 * Check what permissions the current Square production token has
 */

const SQUARE_API_VERSION = '2025-10-16'

async function checkTokenPermissions() {
  const accessToken = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN

  if (!accessToken) {
    console.error('❌ SQUARE_PRODUCTION_ACCESS_TOKEN not found in environment')
    process.exit(1)
  }

  const cleanToken = accessToken.trim()

  console.log('🔍 Checking Square Production Token Permissions\n')
  console.log('Token info:')
  console.log(`  - Length: ${cleanToken.length}`)
  console.log(`  - Prefix: ${cleanToken.substring(0, 20)}`)
  console.log(`  - Suffix: ${cleanToken.substring(cleanToken.length - 10)}`)
  console.log()

  // Test each API endpoint to determine permissions
  const tests = [
    {
      name: 'Locations (Minimal)',
      endpoint: 'https://connect.squareup.com/v2/locations',
      method: 'GET',
      requiredScope: 'MERCHANT_PROFILE_READ',
    },
    {
      name: 'Customers Search',
      endpoint: 'https://connect.squareup.com/v2/customers/search',
      method: 'POST',
      body: { limit: 1 },
      requiredScope: 'CUSTOMERS_READ',
    },
    {
      name: 'Orders Create',
      endpoint: 'https://connect.squareup.com/v2/orders',
      method: 'POST',
      body: {
        idempotency_key: `test-${Date.now()}`,
        order: {
          location_id: process.env.SQUARE_PRODUCTION_LOCATION_ID,
          line_items: [
            {
              name: 'Test',
              quantity: '1',
              base_price_money: { amount: 100, currency: 'USD' },
            },
          ],
        },
      },
      requiredScope: 'ORDERS_WRITE',
    },
    {
      name: 'Payment Links Create',
      endpoint: 'https://connect.squareup.com/v2/online-checkout/payment-links',
      method: 'POST',
      body: {
        quick_pay: {
          name: 'Test',
          price_money: { amount: 100, currency: 'USD' },
          location_id: process.env.SQUARE_PRODUCTION_LOCATION_ID,
        },
      },
      requiredScope: 'ONLINE_STORE_SITE_READ + ONLINE_STORE_SNIPPETS_WRITE',
    },
  ]

  const results: { name: string; success: boolean; scope: string; error?: string }[] = []

  for (const test of tests) {
    try {
      const response = await fetch(test.endpoint, {
        method: test.method,
        headers: {
          'Square-Version': SQUARE_API_VERSION,
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
        body: test.body ? JSON.stringify(test.body) : undefined,
      })

      const data = await response.json()

      if (response.ok) {
        results.push({
          name: test.name,
          success: true,
          scope: test.requiredScope,
        })
        console.log(`✅ ${test.name} - ${test.requiredScope}`)
      } else {
        results.push({
          name: test.name,
          success: false,
          scope: test.requiredScope,
          error: `${response.status}: ${data.errors?.[0]?.code || 'Unknown'}`,
        })
        console.log(
          `❌ ${test.name} - ${test.requiredScope} - ${response.status}: ${data.errors?.[0]?.code || 'Unknown'}`
        )
        if (data.errors?.[0]?.detail) {
          console.log(`   Detail: ${data.errors[0].detail}`)
        }
      }
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        scope: test.requiredScope,
        error: error instanceof Error ? error.message : 'Network error',
      })
      console.log(`❌ ${test.name} - ${test.requiredScope} - Network error`)
    }
  }

  console.log('\n📊 Summary:')
  console.log('='.repeat(60))

  const passedTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length

  console.log(`Total tests: ${results.length}`)
  console.log(`Passed: ${passedTests} ✅`)
  console.log(`Failed: ${failedTests} ❌`)

  if (failedTests > 0) {
    console.log('\n⚠️  MISSING PERMISSIONS DETECTED')
    console.log('\nYour token is missing these scopes:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.scope} (needed for ${r.name})`)
      })

    console.log('\n🔧 HOW TO FIX:')
    console.log('='.repeat(60))
    console.log('\nOption 1: Use Personal Access Token (Recommended for your own account)')
    console.log('  1. Go to https://developer.squareup.com/apps')
    console.log('  2. Click on your app')
    console.log('  3. Go to Credentials tab')
    console.log('  4. Look for "Production Personal Access Token"')
    console.log('  5. If available, click "Show" and copy it')
    console.log('  6. Update Vercel: vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production')
    console.log('\nOption 2: Re-authorize with correct scopes (For OAuth apps)')
    console.log('  1. You need to modify your OAuth authorization URL to request these scopes:')
    console.log('     CUSTOMERS_READ, CUSTOMERS_WRITE, ORDERS_READ, ORDERS_WRITE,')
    console.log('     PAYMENTS_WRITE, ONLINE_STORE_SITE_READ, ONLINE_STORE_SNIPPETS_WRITE')
    console.log('  2. Re-authorize the merchant (yourself) with the updated scopes')
    console.log('  3. Store the new access token from the OAuth callback')
    console.log()
  } else {
    console.log('\n✅ All permissions are working correctly!')
    console.log('If you are still experiencing 401 errors, the token may have been revoked.')
  }
}

checkTokenPermissions().catch(error => {
  console.error('Script error:', error)
  process.exit(1)
})
