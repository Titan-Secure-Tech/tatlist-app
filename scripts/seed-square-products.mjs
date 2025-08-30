import square from 'square';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { SquareClient, SquareEnvironment } = square;

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: SquareEnvironment.SANDBOX,
});

const LOCATION_ID = process.env.SQUARE_SANDBOX_LOCATION_ID?.trim();

// Test products data
const testProducts = [
  {
    name: 'Classic Black Ink',
    description: 'Professional-grade black tattoo ink. Smooth consistency, deep black color.',
    variations: [
      { name: '1oz Bottle', price: 15.00, sku: 'INK-BLK-1OZ' },
      { name: '2oz Bottle', price: 25.00, sku: 'INK-BLK-2OZ' },
      { name: '4oz Bottle', price: 45.00, sku: 'INK-BLK-4OZ' }
    ],
    category: 'Inks'
  },
  {
    name: 'Color Ink Set - Primary Colors',
    description: 'Set of 5 primary color tattoo inks. Red, Blue, Yellow, Green, and White.',
    variations: [
      { name: '5 x 1oz Bottles', price: 65.00, sku: 'INK-PRI-SET5' },
      { name: '5 x 2oz Bottles', price: 120.00, sku: 'INK-PRI-SET5-2OZ' }
    ],
    category: 'Inks'
  },
  {
    name: 'Tattoo Needles - Round Liner',
    description: 'Premium stainless steel round liner needles. Sterile and individually packaged.',
    variations: [
      { name: '3RL (Box of 50)', price: 35.00, sku: 'NDL-3RL-50' },
      { name: '5RL (Box of 50)', price: 35.00, sku: 'NDL-5RL-50' },
      { name: '7RL (Box of 50)', price: 35.00, sku: 'NDL-7RL-50' },
      { name: '9RL (Box of 50)', price: 35.00, sku: 'NDL-9RL-50' }
    ],
    category: 'Needles'
  },
  {
    name: 'Tattoo Needles - Magnum Shader',
    description: 'High-quality magnum shader needles for smooth shading.',
    variations: [
      { name: '5M1 (Box of 50)', price: 38.00, sku: 'NDL-5M1-50' },
      { name: '7M1 (Box of 50)', price: 38.00, sku: 'NDL-7M1-50' },
      { name: '9M1 (Box of 50)', price: 38.00, sku: 'NDL-9M1-50' },
      { name: '11M1 (Box of 50)', price: 38.00, sku: 'NDL-11M1-50' }
    ],
    category: 'Needles'
  },
  {
    name: 'Disposable Tattoo Tubes',
    description: 'Clear disposable tattoo tubes with grips. Pre-sterilized.',
    variations: [
      { name: 'Diamond Tip (Box of 20)', price: 28.00, sku: 'TUB-DIA-20' },
      { name: 'Round Tip (Box of 20)', price: 28.00, sku: 'TUB-RND-20' },
      { name: 'Flat Tip (Box of 20)', price: 28.00, sku: 'TUB-FLT-20' }
    ],
    category: 'Tubes & Grips'
  },
  {
    name: 'Tattoo Machine - Rotary Pen',
    description: 'Professional rotary tattoo pen machine. Lightweight and versatile.',
    variations: [
      { name: 'Black', price: 350.00, sku: 'MCH-ROT-BLK' },
      { name: 'Silver', price: 350.00, sku: 'MCH-ROT-SLV' },
      { name: 'Red', price: 350.00, sku: 'MCH-ROT-RED' }
    ],
    category: 'Machines'
  },
  {
    name: 'Coil Tattoo Machine Set',
    description: 'Traditional coil tattoo machine set. Includes liner and shader.',
    variations: [
      { name: 'Complete Set', price: 450.00, sku: 'MCH-COIL-SET' }
    ],
    category: 'Machines'
  },
  {
    name: 'Tattoo Power Supply',
    description: 'Digital tattoo power supply with foot pedal. LCD display.',
    variations: [
      { name: 'Standard', price: 125.00, sku: 'PWR-STD' },
      { name: 'Wireless', price: 225.00, sku: 'PWR-WLS' }
    ],
    category: 'Power Supplies'
  },
  {
    name: 'Transfer Paper',
    description: 'Thermal tattoo transfer paper for stencils.',
    variations: [
      { name: '100 Sheets', price: 22.00, sku: 'TPR-100' },
      { name: '500 Sheets', price: 85.00, sku: 'TPR-500' }
    ],
    category: 'Supplies'
  },
  {
    name: 'Green Soap',
    description: 'Medical grade green soap for tattoo cleaning.',
    variations: [
      { name: '16oz Bottle', price: 12.00, sku: 'SOAP-16OZ' },
      { name: '32oz Bottle', price: 20.00, sku: 'SOAP-32OZ' },
      { name: '1 Gallon', price: 35.00, sku: 'SOAP-GAL' }
    ],
    category: 'Supplies'
  },
  {
    name: 'Nitrile Gloves - Black',
    description: 'Powder-free black nitrile gloves. Latex-free.',
    variations: [
      { name: 'Small (Box of 100)', price: 18.00, sku: 'GLV-S-100' },
      { name: 'Medium (Box of 100)', price: 18.00, sku: 'GLV-M-100' },
      { name: 'Large (Box of 100)', price: 18.00, sku: 'GLV-L-100' },
      { name: 'X-Large (Box of 100)', price: 18.00, sku: 'GLV-XL-100' }
    ],
    category: 'Supplies'
  },
  {
    name: 'Tattoo Aftercare Cream',
    description: 'Premium tattoo aftercare cream. Promotes healing and color retention.',
    variations: [
      { name: '2oz Jar', price: 15.00, sku: 'CARE-2OZ' },
      { name: '4oz Jar', price: 25.00, sku: 'CARE-4OZ' },
      { name: '8oz Jar', price: 40.00, sku: 'CARE-8OZ' }
    ],
    category: 'Aftercare'
  },
  {
    name: 'Barrier Film',
    description: 'Protective barrier film for tattoo equipment and surfaces.',
    variations: [
      { name: '1200 Sheets (4" x 6")', price: 28.00, sku: 'BAR-1200' }
    ],
    category: 'Supplies'
  },
  {
    name: 'Tattoo Practice Skin',
    description: 'Synthetic practice skin for tattoo training.',
    variations: [
      { name: '5 Sheets (8" x 6")', price: 32.00, sku: 'SKIN-5' },
      { name: '10 Sheets (8" x 6")', price: 55.00, sku: 'SKIN-10' }
    ],
    category: 'Training'
  },
  {
    name: 'Stencil Primer',
    description: 'Professional stencil application solution for long-lasting transfers.',
    variations: [
      { name: '4oz Bottle', price: 18.00, sku: 'STEN-4OZ' },
      { name: '8oz Bottle', price: 30.00, sku: 'STEN-8OZ' }
    ],
    category: 'Supplies'
  }
];

async function createProducts() {
  console.log('🎨 Starting to create test products in Square...\n');
  
  const createdProducts = [];
  const errors = [];
  const allObjects = [];

  // Build all catalog objects first
  for (const product of testProducts) {
    console.log(`Preparing product: ${product.name}`);
    
    // Create variations
    const variations = product.variations.map(v => ({
      type: 'ITEM_VARIATION',
      id: `#${v.sku}`,
      itemVariationData: {
        name: v.name,
        pricingType: 'FIXED_PRICING',
        priceMoney: {
          amount: BigInt(Math.round(v.price * 100)),
          currency: 'USD'
        },
        sku: v.sku,
        trackInventory: false,
        availableForSale: true,
      },
      presentAtLocationIds: [LOCATION_ID]
    }));

    // Create the main item
    const catalogObject = {
      type: 'ITEM',
      id: `#${product.name.replace(/\s+/g, '_').toUpperCase()}`,
      itemData: {
        name: product.name,
        description: product.description,
        variations: variations,
        productType: 'REGULAR',
        availableOnline: false,
        availableForPickup: false,
      },
      presentAtLocationIds: [LOCATION_ID]
    };

    allObjects.push(catalogObject);
  }

  // Batch create all products at once
  try {
    console.log(`\nCreating ${allObjects.length} products in batch...`);
    
    const { data, error } = await squareClient.catalog.batchUpsert({
      idempotencyKey: randomUUID(),
      batches: [{
        objects: allObjects
      }]
    });
    
    if (error) {
      console.error('❌ Error creating products:', error);
      if (error.errors) {
        error.errors.forEach(e => console.error('  -', e.detail));
      }
    } else if (data) {
      console.log(`✅ Successfully created ${data.objects?.length || 0} catalog objects`);
      
      if (data.objects) {
        const items = data.objects.filter(obj => obj.type === 'ITEM');
        items.forEach(item => {
          console.log(`  ✅ ${item.itemData?.name}`);
          createdProducts.push(item.itemData?.name);
        });
      }
    }
  } catch (err) {
    console.error('❌ Batch creation error:', err.message);
    if (err.response?.data) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created ${createdProducts.length} products`);
  
  if (errors.length > 0) {
    console.log(`❌ Failed to create ${errors.length} products:`);
    errors.forEach(e => console.log(`  - ${e.product}: ${e.error}`));
  }

  console.log('\n🎉 Product seeding complete!');
  console.log('Visit http://localhost:7500/products to see your new products');
}

// Run the script
createProducts().catch(console.error);