#!/usr/bin/env bun
import { SquareClient, SquareEnvironment } from 'square'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const token = process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!

console.log('Token check:')
console.log('- Has token:', !!token)
console.log('- Token length:', token?.length)
console.log('- Token starts with:', token?.substring(0, 10))
console.log('- Token ends with:', token?.substring(token.length - 10))
console.log('- Full token:', token)
console.log()

const client = new SquareClient({
  accessToken: token,
  environment: SquareEnvironment.Production,
})

console.log('Client check:')
console.log('- Has access token:', !!client.accessToken)
console.log('- Environment:', client.environment)
console.log()

try {
  console.log('Testing catalog API...')
  const response = await client.catalog.list({ types: 'ITEM' })
  console.log('✅ SUCCESS!')
  console.log('- Objects found:', response.result.objects?.length || 0)
  console.log('- Has cursor:', !!response.result.cursor)
} catch (error) {
  console.error('❌ FAILED:', error)
}
