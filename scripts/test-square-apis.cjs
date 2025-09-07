const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testSquareAPIs() {
  try {
    const client = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('Square Client created successfully');
    console.log('Available APIs on client:');
    
    // List all available APIs
    const apis = Object.getOwnPropertyNames(client).filter(prop => 
      prop.endsWith('Api') || prop.endsWith('api')
    );
    
    console.log('APIs found:', apis);
    
    // Try to access specific APIs we need
    const locationsApi = client.locationsApi;
    const catalogApi = client.catalogApi;
    const ordersApi = client.ordersApi;
    const checkoutApi = client.checkoutApi;
    
    console.log('\nAPI availability:');
    console.log('- locationsApi:', !!locationsApi);
    console.log('- catalogApi:', !!catalogApi);
    console.log('- ordersApi:', !!ordersApi);
    console.log('- checkoutApi:', !!checkoutApi);
    
    if (locationsApi) {
      console.log('\nTesting locations API...');
      const { result } = await locationsApi.listLocations();
      console.log(`✅ Found ${result.locations?.length || 0} locations`);
      
      if (result.locations && result.locations.length > 0) {
        const location = result.locations[0];
        console.log(`Main location: ${location.name} (${location.id})`);
      }
    }
    
    if (catalogApi) {
      console.log('\nTesting catalog API...');
      const { result } = await catalogApi.listCatalog({
        types: 'ITEM'
      });
      console.log(`✅ Found ${result.objects?.length || 0} catalog items`);
      
      if (result.objects && result.objects.length > 0) {
        console.log('\nFirst item:');
        const item = result.objects[0];
        console.log(`- Name: ${item.itemData?.name}`);
        console.log(`- ID: ${item.id}`);
        if (item.itemData?.variations) {
          console.log(`- Variations: ${item.itemData.variations.length}`);
        }
      }
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

testSquareAPIs();