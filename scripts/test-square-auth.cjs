const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testSquareAuth() {
  try {
    console.log('Testing Square API authentication...\n');

    // Test with local sandbox token
    console.log('Environment Variables:');
    console.log('- SQUARE_SANDBOX_ACCESS_TOKEN:', process.env.SQUARE_SANDBOX_ACCESS_TOKEN ? `${process.env.SQUARE_SANDBOX_ACCESS_TOKEN.substring(0, 10)}...` : 'MISSING');
    console.log('- SQUARE_SANDBOX_LOCATION_ID:', process.env.SQUARE_SANDBOX_LOCATION_ID || 'MISSING');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');

    const client = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('\n1. Testing Locations API...');
    const locationsResult = await client.locations.list();
    console.log('✅ Locations API Success!');
    console.log('- Status Code:', locationsResult.statusCode);
    console.log('- Locations found:', locationsResult.result?.locations?.length || 0);
    if (locationsResult.result?.locations?.[0]) {
      console.log('- First location ID:', locationsResult.result.locations[0].id);
      console.log('- First location name:', locationsResult.result.locations[0].name);
    }

    console.log('\n2. Testing Catalog API...');
    const catalogResult = await client.catalog.list({
      types: 'ITEM',
    });
    console.log('✅ Catalog API Success!');
    console.log('- Status Code:', catalogResult.statusCode);
    console.log('- Items found:', catalogResult.result?.objects?.length || 0);

    console.log('\n3. Testing Orders API (create test order)...');
    const testOrderRequest = {
      order: {
        locationId: process.env.SQUARE_SANDBOX_LOCATION_ID,
        lineItems: [
          {
            quantity: '1',
            name: 'Test Item',
            basePriceAmount: 100, // $1.00
            currency: 'USD',
          }
        ],
      },
      idempotencyKey: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
    };

    const orderResult = await client.orders.create(testOrderRequest);
    console.log('✅ Orders API Success!');
    console.log('- Status Code:', orderResult.statusCode);
    console.log('- Order ID:', orderResult.result?.order?.id);
    console.log('- Total Money:', orderResult.result?.order?.totalMoney);

    console.log('\n🎉 All Square API tests passed! Authentication is working correctly.');
    
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

testSquareAuth();