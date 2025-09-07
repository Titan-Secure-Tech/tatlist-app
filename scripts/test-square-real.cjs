const { Client, Environment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testSquareReal() {
  try {
    // Try the correct client initialization
    const client = new Client({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: Environment.Sandbox,
    });

    console.log('Testing Square SDK with proper Client class...');
    console.log('Access Token exists:', !!process.env.SQUARE_SANDBOX_ACCESS_TOKEN);
    console.log('Location ID exists:', !!process.env.SQUARE_SANDBOX_LOCATION_ID);
    
    // Test locations API
    const locationsApi = client.locationsApi;
    const { result: locationsResult } = await locationsApi.listLocations();
    
    console.log('\n✅ Successfully connected to Square API');
    console.log(`Found ${locationsResult.locations?.length || 0} location(s)`);
    
    if (locationsResult.locations && locationsResult.locations.length > 0) {
      console.log('\nLocation details:');
      locationsResult.locations.forEach(location => {
        console.log(`- ${location.name} (ID: ${location.id})`);
        console.log(`  Status: ${location.status}`);
        if (location.businessName) {
          console.log(`  Business: ${location.businessName}`);
        }
      });
    }
    
    // Test catalog API
    const catalogApi = client.catalogApi;
    const { result: catalogResult } = await catalogApi.listCatalog({
      types: 'ITEM'
    });
    
    console.log(`\n✅ Found ${catalogResult.objects?.length || 0} catalog item(s)`);
    
    if (catalogResult.objects && catalogResult.objects.length > 0) {
      console.log('\nFirst few items:');
      catalogResult.objects.slice(0, 3).forEach(item => {
        console.log(`- ${item.itemData?.name} (${item.id})`);
        if (item.itemData?.variations) {
          item.itemData.variations.forEach(v => {
            const price = v.itemVariationData?.priceMoney?.amount 
              ? (Number(v.itemVariationData.priceMoney.amount) / 100).toFixed(2)
              : 'N/A';
            console.log(`  - ${v.itemVariationData?.name || 'Default'}: $${price}`);
          });
        }
      });
    } else {
      console.log('\n⚠️  No products found in Square catalog.');
      console.log('You can create products at: https://squareup.com/dashboard/items/library');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.errors) {
      console.error('Error Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

testSquareReal();