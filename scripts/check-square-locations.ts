#!/usr/bin/env bun

const token = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!

const response = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM', {
  method: 'GET',
  headers: {
    'Square-Version': '2025-01-23',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})

const data = await response.json()

console.log('First 5 products location info:')
console.log('================================\n')

for (let i = 0; i < Math.min(5, data.objects?.length || 0); i++) {
  const product = data.objects[i]
  console.log(`Product: ${product.item_data?.name}`)
  console.log(`- ID: ${product.id}`)
  console.log(`- Present at all locations: ${product.present_at_all_locations}`)
  console.log(`- Present at location IDs: ${JSON.stringify(product.present_at_location_ids)}`)
  console.log()
}

console.log('\nExpected location ID from env: LQMAS99P4BA7N')
