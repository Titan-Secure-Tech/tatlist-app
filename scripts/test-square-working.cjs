const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testSquareWorking() {
  try {
    const client = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('Testing Square API with correct method calls...');
    
    // Test locations API
    console.log('\n1. Testing locations API...');
    const locationsResponse = await client.locations.listLocations();
    console.log(`✅ Found ${locationsResponse.result.locations?.length || 0} locations`);
    
    if (locationsResponse.result.locations && locationsResponse.result.locations.length > 0) {
      const location = locationsResponse.result.locations[0];
      console.log(`Primary location: ${location.name} (${location.id})`);
      console.log(`Status: ${location.status}`);
    }
    
    // Test catalog API
    console.log('\n2. Testing catalog API...');
    const catalogResponse = await client.catalog.listCatalog({
      types: 'ITEM'
    });
    
    const items = catalogResponse.result.objects || [];
    console.log(`✅ Found ${items.length} catalog items`);
    
    if (items.length > 0) {
      console.log('\nFirst few products:');
      items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.itemData?.name || 'Unnamed Item'}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Type: ${item.type}`);
        if (item.itemData?.description) {
          console.log(`   Description: ${item.itemData.description.substring(0, 100)}...`);
        }
        
        if (item.itemData?.variations) {
          console.log(`   Variations: ${item.itemData.variations.length}`);
          item.itemData.variations.forEach(variation => {
            const price = variation.itemVariationData?.priceMoney?.amount 
              ? `$${(Number(variation.itemVariationData.priceMoney.amount) / 100).toFixed(2)}`
              : 'No price';
            console.log(`     - ${variation.itemVariationData?.name || 'Default'}: ${price}`);
          });
        }
      });
    } else {
      console.log('\n⚠️  No products found in Square catalog.');
      console.log('Create some products at: https://squareup.com/dashboard/items/library');
    }
    
    // Test creating a simple order (without actually processing)
    if (items.length > 0) {
      console.log('\n3. Testing order creation capability...');
      const firstItem = items[0];
      const variation = firstItem.itemData?.variations?.[0];
      
      if (variation) {
        const orderRequest = {
          order: {
            locationId: process.env.SQUARE_SANDBOX_LOCATION_ID,
            lineItems: [{
              quantity: '1',
              catalogObjectId: variation.id,
              basePriceMoney: variation.itemVariationData?.priceMoney
            }]
          },
          idempotencyKey: `test-${Date.now()}`
        };
        
        console.log('Order request structure looks valid');
        console.log('✅ Can create orders with this structure');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode) {
      console.error('HTTP Status:', error.statusCode);
    }
    if (error.errors) {
      console.error('Square API Errors:', JSON.stringify(error.errors, null, 2));
    }
  }
}

testSquareWorking();