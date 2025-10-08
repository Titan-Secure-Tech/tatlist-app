import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Vitest configuration for E2E tests
 * These tests use Puppeteer for browser automation
 * and run against a live development server
 */
export default defineConfig({
  test: {
    globals: true,
    // Use Node environment for E2E tests (not happy-dom)
    // since we're running Puppeteer which controls a real browser
    environment: 'node',
    include: ['tests/e2e/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'coverage'],
    testTimeout: 60000, // 60s timeout for E2E tests
    hookTimeout: 30000, // 30s timeout for beforeAll/afterAll
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/types': path.resolve(__dirname, './types'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/utils': path.resolve(__dirname, './utils'),
    },
  },
})
