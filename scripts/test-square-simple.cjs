const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: SquareEnvironment.SANDBOX,
});

async function testConnection() {
  try {
    console.log('Testing Square API connection...');
    console.log('Access Token:', process.env.SQUARE_SANDBOX_ACCESS_TOKEN ? 'Found' : 'Missing');
    console.log('Location ID:', process.env.SQUARE_SANDBOX_LOCATION_ID ? 'Found' : 'Missing');
    
    // Test 1: Fetch locations
    const locationsResponse = await squareClient.locationsApi.listLocations();
    const locations = locationsResponse.result.locations;
    
    console.log('\n✅ Successfully connected to Square API');
    console.log(`Found ${locations?.length || 0} location(s)`);
    
    if (locations && locations.length > 0) {
      console.log('\nLocation details:');
      locations.forEach(location => {
        console.log(`- ${location.name} (ID: ${location.id})`);
        console.log(`  Status: ${location.status}`);
        console.log(`  Business Name: ${location.businessName || 'N/A'}`);
      });
    }
    
    // Test 2: Fetch catalog items
    const catalogResponse = await squareClient.catalogApi.listCatalog({
      types: 'ITEM'
    });
    
    const items = catalogResponse.result.objects;
    console.log(`\n✅ Found ${items?.length || 0} catalog item(s)`);
    
    if (items && items.length > 0) {
      console.log('\nFirst few items:');
      items.slice(0, 3).forEach(item => {
        console.log(`- ${item.itemData?.name} (${item.id})`);
        if (item.itemData?.variations) {
          item.itemData.variations.forEach(v => {
            const price = v.itemVariationData?.priceMoney?.amount 
              ? (Number(v.itemVariationData.priceMoney.amount) / 100).toFixed(2)
              : 'N/A';
            console.log(`  - ${v.itemVariationData?.name}: $${price}`);
          });
        }
      });
    } else {
      console.log('\nNo items found. You may need to create some products in your Square dashboard.');
      console.log('Go to: https://squareup.com/dashboard/items/library');
    }
    
  } catch (error) {
    console.error('\n❌ Error connecting to Square API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.statusCode);
      console.error('Response data:', error.response.body);
    }
    if (error.errors) {
      console.error('Error details:', error.errors);
    }
  }
}

testConnection();