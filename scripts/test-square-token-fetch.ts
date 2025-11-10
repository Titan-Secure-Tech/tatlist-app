#!/usr/bin/env bun

const token =
  process.env.SQUARE_PRODUCTION_ACCESS_TOKEN ||
  'EAAAl2-KdUHivJEB5hzjSwFkJE0iM6HLno_EbUEsQlgQyjrH7Upp5EJWiM3xr1eG'

console.log('Testing Square API with fetch...')
console.log('Token:', token.substring(0, 10) + '...' + token.substring(token.length - 5))

try {
  const response = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM', {
    method: 'GET',
    headers: {
      'Square-Version': '2025-01-23',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  console.log('Status:', response.status)

  const data = await response.json()

  if (response.ok) {
    console.log('✅ SUCCESS!')
    console.log('Objects found:', data.objects?.length || 0)
    console.log('First product:', data.objects?.[0]?.item_data?.name)
  } else {
    console.log('❌ FAILED')
    console.log('Error:', JSON.stringify(data, null, 2))
  }
} catch (error) {
  console.error('❌ Exception:', error)
}
