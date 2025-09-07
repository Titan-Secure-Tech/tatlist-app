#!/usr/bin/env bun

import { getSquareConfig, isSandboxUser } from '../lib/square/client-config'

console.log('🧪 Testing Square Sandbox Mode Configuration\n')

// Test emails
const testEmails = [
  'crushjunkmail@gmail.com',
  'james@familiawashington.com',
  'regular@example.com',
  'production@user.com',
]

console.log('1. Testing hardcoded sandbox users:')
testEmails.forEach(email => {
  const isSandbox = isSandboxUser(email)
  console.log(`   ${email}: ${isSandbox ? '✅ SANDBOX' : '❌ PRODUCTION'}`)
})

console.log('\n2. Testing Square configuration:')

// Test sandbox configuration
const sandboxConfig = getSquareConfig(true)
console.log(`   Sandbox mode:`)
console.log(`     - Environment: ${sandboxConfig.environment}`)
console.log(`     - Location ID: ${sandboxConfig.locationId}`)
console.log(`     - Application ID: ${sandboxConfig.applicationId}`)

// Test production configuration
const productionConfig = getSquareConfig(false)
console.log(`   Production mode:`)
console.log(`     - Environment: ${productionConfig.environment}`)
console.log(`     - Location ID: ${productionConfig.locationId || 'NOT SET'}`)
console.log(`     - Application ID: ${productionConfig.applicationId || 'NOT SET'}`)

console.log('\n3. Testing checkout flow simulation:')
const testCheckout = async (email: string) => {
  const useSandbox = isSandboxUser(email)
  const config = getSquareConfig(useSandbox)

  console.log(`   ${email}:`)
  console.log(`     - Mode: ${config.environment}`)
  console.log(
    `     - Payment URL: ${config.environment === 'sandbox' ? 'https://sandbox.squareup.com' : 'https://squareup.com'}`
  )

  if (config.environment === 'sandbox') {
    console.log(`     - Test cards available: YES`)
    console.log(`     - Test card example: 4111 1111 1111 1111`)
  } else {
    console.log(`     - Test cards available: NO`)
    console.log(`     - Real payment required: YES`)
  }
}

await testCheckout('crushjunkmail@gmail.com')
await testCheckout('regular@example.com')

console.log('\n✅ Sandbox mode configuration test complete!')
