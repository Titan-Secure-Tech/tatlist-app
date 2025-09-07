const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config({ path: '.env.local' });

async function testCheckoutFlow() {
  try {
    console.log('Testing complete checkout flow...\n');

    // Test data
    const testCartItems = [
      {
        id: 'tattoo-machine-1',
        name: 'Professional Tattoo Machine',
        price: 299.99,
        quantity: 1,
        variant: 'Black'
      },
      {
        id: 'tattoo-ink-set-1',
        name: 'Professional Ink Set',
        price: 89.99,
        quantity: 2,
        variant: 'Standard Set'
      }
    ];

    const testDeliveryAddress = {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001'
    };

    const testCustomerInfo = {
      name: 'John Smith',
      phone: '+1234567890',
      email: 'john@example.com'
    };

    // Test checkout API endpoint
    console.log('1. Testing checkout API endpoint...');
    const response = await fetch('http://localhost:7500/api/square/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: testCartItems,
        deliveryAddress: testDeliveryAddress,
        customerInfo: testCustomerInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Checkout API Response:');
    console.log('- Order ID:', result.orderId);
    console.log('- Payment Link:', result.paymentLink);
    console.log('- Total:', result.total);
    console.log('- Source:', result.source);
    if (result.note) {
      console.log('- Note:', result.note);
    }

    // Test products API endpoint
    console.log('\n2. Testing products API endpoint...');
    const productsResponse = await fetch('http://localhost:7500/api/square/products');
    
    if (!productsResponse.ok) {
      throw new Error(`Products API HTTP ${productsResponse.status}: ${productsResponse.statusText}`);
    }

    const productsResult = await productsResponse.json();
    console.log('✅ Products API Response:');
    console.log('- Total Products:', productsResult.total);
    console.log('- Source:', productsResult.source);
    if (productsResult.note) {
      console.log('- Note:', productsResult.note);
    }
    console.log('- Sample Product:', productsResult.products?.[0]?.name || 'None');

    console.log('\n🎉 Checkout flow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Checkout flow test failed:');
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testCheckoutFlow();