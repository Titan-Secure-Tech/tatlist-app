const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.prod-check' });

async function testProdSquareAuth() {
  try {
    console.log('Testing Square API with PRODUCTION credentials...\n');

    console.log('Environment Variables:');
    console.log('- SQUARE_PRODUCTION_ACCESS_TOKEN:', process.env.SQUARE_PRODUCTION_ACCESS_TOKEN ? `${process.env.SQUARE_PRODUCTION_ACCESS_TOKEN.substring(0, 10)}...` : 'MISSING');
    console.log('- SQUARE_PRODUCTION_LOCATION_ID:', process.env.SQUARE_PRODUCTION_LOCATION_ID || 'MISSING');
    console.log('- SQUARE_SANDBOX_ACCESS_TOKEN:', process.env.SQUARE_SANDBOX_ACCESS_TOKEN ? `${process.env.SQUARE_SANDBOX_ACCESS_TOKEN.substring(0, 10)}...` : 'MISSING');

    // Test Production Environment
    console.log('\n=== TESTING PRODUCTION ENVIRONMENT ===');
    const prodClient = new SquareClient({
      accessToken: process.env.SQUARE_PRODUCTION_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Production,
    });

    console.log('1. Testing Production Locations API...');
    const prodLocationsResult = await prodClient.locations.list();
    console.log('✅ Production Locations API Success!');
    console.log('- Status Code:', prodLocationsResult.statusCode);
    console.log('- Locations found:', prodLocationsResult.result?.locations?.length || 0);
    if (prodLocationsResult.result?.locations?.[0]) {
      console.log('- First location ID:', prodLocationsResult.result.locations[0].id);
      console.log('- First location name:', prodLocationsResult.result.locations[0].name);
    }

    console.log('\n2. Testing Production Catalog API...');
    const prodCatalogResult = await prodClient.catalog.list({
      types: 'ITEM',
    });
    console.log('✅ Production Catalog API Success!');
    console.log('- Status Code:', prodCatalogResult.statusCode);
    console.log('- Items found:', prodCatalogResult.result?.objects?.length || 0);

    console.log('\n=== TESTING SANDBOX ENVIRONMENT ===');
    const sandboxClient = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('3. Testing Sandbox Locations API...');
    const sandboxLocationsResult = await sandboxClient.locations.list();
    console.log('✅ Sandbox Locations API Success!');
    console.log('- Status Code:', sandboxLocationsResult.statusCode);
    console.log('- Locations found:', sandboxLocationsResult.result?.locations?.length || 0);

    console.log('\n🎉 All Square API tests with production tokens passed!');
    
  } catch (error) {
    console.error('\n❌ Square API Error:');
    console.error('Error message:', error.message);
    if (error.statusCode) {
      console.error('HTTP Status:', error.statusCode);
    }
    if (error.errors) {
      console.error('Square API Errors:', JSON.stringify(error.errors, null, 2));
    }
  }
}

testProdSquareAuth();