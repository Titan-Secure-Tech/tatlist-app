#!/usr/bin/env bun

/**
 * Build script to compile TypeScript service worker to JavaScript
 * This runs during the build process to convert app/sw.ts to public/sw.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const projectRoot = join(import.meta.dir, '..')
const swSource = join(projectRoot, 'app', 'sw.ts')
const swDest = join(projectRoot, 'public', 'sw.js')

console.log('Building service worker...')
console.log(`  Source: ${swSource}`)
console.log(`  Destination: ${swDest}`)

// Use Bun's built-in TypeScript transpiler
const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'browser',
})

try {
  // Read the TypeScript source
  const tsCode = readFileSync(swSource, 'utf-8')

  // Transpile to JavaScript
  const jsCode = transpiler.transformSync(tsCode)

  // Write the JavaScript output
  writeFileSync(swDest, jsCode)

  console.log('✓ Service worker built successfully!')
} catch (error) {
  console.error('✗ Error building service worker:', error)
  process.exit(1)
}
