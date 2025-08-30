import square from 'square';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { SquareClient, SquareEnvironment } = square;

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: SquareEnvironment.SANDBOX,
});

async function testConnection() {
  try {
    console.log('Testing Square API connection...');
    console.log('Access Token:', process.env.SQUARE_SANDBOX_ACCESS_TOKEN ? 'Found' : 'Missing');
    
    // Test 1: Fetch locations
    const { data: locationsResult } = await squareClient.locations.listLocations();
    console.log('\n✅ Successfully connected to Square API');
    console.log(`Found ${locationsResult?.locations?.length || 0} location(s)`);
    
    if (locationsResult?.locations && locationsResult.locations.length > 0) {
      console.log('\nLocation details:');
      locationsResult.locations.forEach(location => {
        console.log(`- ${location.name} (${location.id})`);
      });
    }
    
    // Test 2: Fetch catalog items
    const { data: catalogResult } = await squareClient.catalog.listCatalog({
      types: 'ITEM'
    });
    
    console.log(`\n✅ Found ${catalogResult?.objects?.length || 0} catalog item(s)`);
    
    if (catalogResult?.objects && catalogResult.objects.length > 0) {
      console.log('\nFirst few items:');
      catalogResult.objects.slice(0, 3).forEach(item => {
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
    }
    
  } catch (error) {
    console.error('\n❌ Error connecting to Square API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    if (error.errors) {
      console.error('Error details:', error.errors);
    }
  }
}

testConnection();