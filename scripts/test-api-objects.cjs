const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testApiObjects() {
  try {
    const client = new SquareClient({
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
      environment: SquareEnvironment.Sandbox,
    });

    console.log('Testing API object access...');
    
    // Test locations API
    const locationsApi = client.locations;
    console.log('Locations API exists:', !!locationsApi);
    console.log('Locations API methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(locationsApi)));
    
    // Test catalog API
    const catalogApi = client.catalog;
    console.log('\nCatalog API exists:', !!catalogApi);
    console.log('Catalog API methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(catalogApi)));
    
    // Test orders API
    const ordersApi = client.orders;
    console.log('\nOrders API exists:', !!ordersApi);
    console.log('Orders API methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ordersApi)));
    
    // Test checkout API
    const checkoutApi = client.checkout;
    console.log('\nCheckout API exists:', !!checkoutApi);
    console.log('Checkout API methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(checkoutApi)));
    
    // Try to actually call a method
    if (locationsApi && typeof locationsApi.listLocations === 'function') {
      console.log('\nTrying locationsApi.listLocations()...');
      const result = await locationsApi.listLocations();
      console.log('✅ Success! Found locations:', result.result?.locations?.length || 0);
    } else if (locationsApi && typeof locationsApi.list === 'function') {
      console.log('\nTrying locationsApi.list()...');
      const result = await locationsApi.list();
      console.log('✅ Success! Found locations:', result.result?.locations?.length || 0);
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

testApiObjects();