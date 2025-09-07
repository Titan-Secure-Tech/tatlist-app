const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function exploreSquareClient() {
  try {
    const client = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('Square Client created');
    console.log('Client instance keys:', Object.keys(client));
    console.log('Client properties:', Object.getOwnPropertyNames(client));
    console.log('Client prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
    
    // Check if APIs are methods rather than properties
    console.log('\nTrying method access patterns...');
    
    // Pattern 1: Direct method calls
    try {
      if (typeof client.listLocations === 'function') {
        console.log('✓ client.listLocations exists');
        const result = await client.listLocations();
        console.log('listLocations result keys:', Object.keys(result));
      }
    } catch (e) {
      console.log('✗ client.listLocations failed:', e.message);
    }
    
    // Pattern 2: API namespace access
    const Square = require('square').Square;
    if (Square) {
      console.log('\nChecking Square.api namespace...');
      console.log('Square keys:', Object.keys(Square));
    }
    
    // Pattern 3: Check the _options property
    if (client._options) {
      console.log('\nClient options:', Object.keys(client._options));
    }
    
    // Pattern 4: Try instantiating API classes directly
    console.log('\nTrying direct API imports...');
    try {
      const { LocationsApi, CatalogApi } = require('square').Square;
      if (LocationsApi) {
        console.log('✓ LocationsApi class exists');
        // Try to create instance
        const locationsApi = new LocationsApi(client);
        console.log('LocationsApi instance created');
      }
    } catch (e) {
      console.log('✗ Direct API import failed:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

exploreSquareClient();