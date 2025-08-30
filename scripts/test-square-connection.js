import square from 'square'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const squareClient = new square.Client({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: square.Environment.Sandbox,
  squareVersion: '2024-12-11',
})

async function testConnection() {
  try {
    console.log('Testing Square API connection...')

    // Test 1: Fetch locations
    const { result: locationsResult } = await squareClient.locationsApi.listLocations()
    console.log('\n✅ Successfully connected to Square API')
    console.log(`Found ${locationsResult.locations?.length || 0} location(s)`)

    if (locationsResult.locations && locationsResult.locations.length > 0) {
      console.log('\nLocation details:')
      locationsResult.locations.forEach(location => {
        console.log(`- ${location.name} (${location.id})`)
      })
    }

    // Test 2: Fetch catalog items
    const { result: catalogResult } = await squareClient.catalogApi.listCatalog(undefined, 'ITEM')

    console.log(`\n✅ Found ${catalogResult.objects?.length || 0} catalog item(s)`)

    if (catalogResult.objects && catalogResult.objects.length > 0) {
      console.log('\nFirst few items:')
      catalogResult.objects.slice(0, 3).forEach(item => {
        console.log(`- ${item.itemData?.name} (${item.id})`)
      })
    }
  } catch (error) {
    console.error('\n❌ Error connecting to Square API:', error.message)
    if (error.errors) {
      console.error('Error details:', error.errors)
    }
  }
}

testConnection()
