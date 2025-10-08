/**
 * Simplified E2E Test: Checkout Flow - Cart State Persistence Bug
 *
 * RED PHASE: This test demonstrates the cart state persistence bug that occurs
 * when navigating between pages. The bug is caused by a race condition in the
 * Zustand persist middleware's custom storage implementation.
 *
 * THE BUG:
 * 1. Cart state uses userId-based localStorage keys (tatlist-cart-{userId} or tatlist-cart-guest)
 * 2. Custom storage getItem() reads from useCartStore.getState().userId
 * 3. When page navigates/refreshes, CartProvider's useEffect runs
 * 4. CartProvider calls setUserId() which clears the cart if userId changes
 * 5. But the persist middleware's getItem() is called BEFORE userId is set
 * 6. This causes it to read from the wrong localStorage key
 * 7. Result: Cart appears empty even though data exists in localStorage
 *
 * This test uses Puppeteer to simulate the real browser behavior.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

// Helper function to wait for a specified amount of time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Cart State Persistence Bug - Simplified Test', () => {
  let browser: Browser
  let page: Page
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7500'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
  }, 30000)

  afterAll(async () => {
    await page?.close()
    await browser?.close()
  })

  it('should demonstrate the cart state loss bug when userId changes', async () => {
    // ARRANGE: Go to home page and set up initial cart state
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })

    // Inject cart state directly into localStorage (simulating guest cart)
    await page.evaluate(() => {
      const guestCart = {
        state: {
          items: [
            {
              id: 'test-product-1',
              name: 'Test Product',
              price: 1000,
              quantity: 2,
              variant: 'Standard',
            },
          ],
          userId: null,
          cartCount: 2,
          cartDetails: {
            'test-product-1': {
              id: 'test-product-1',
              name: 'Test Product',
              price: 1000,
              quantity: 2,
              variant: 'Standard',
            },
          },
          totalPrice: 2000,
          formattedTotalPrice: '$20.00',
        },
        version: 0,
      }

      localStorage.setItem('tatlist-cart-guest', JSON.stringify(guestCart))
      console.log('Set guest cart in localStorage:', guestCart)
    })

    // Verify cart was saved
    const savedCart = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest')
    })
    expect(savedCart).toBeTruthy()
    console.log('Cart saved successfully:', JSON.parse(savedCart!)?.state?.items?.length, 'items')

    // ACT: Navigate to a different page (simulating checkout navigation)
    // This triggers a re-render and CartProvider re-initialization
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' })

    // Wait for React to hydrate
    await wait(1000)

    // ASSERT: Check if cart data still exists in localStorage
    const cartAfterNav = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest')
    })

    expect(cartAfterNav).toBeTruthy()
    const parsedCart = JSON.parse(cartAfterNav!)
    expect(parsedCart.state.items.length).toBe(1)
    console.log(
      'Cart still in localStorage after navigation:',
      parsedCart.state.items.length,
      'items'
    )

    // THE BUG: Now check if Zustand store actually loaded the cart
    // We'll do this by checking the window object (if we exposed the store)
    // Or by navigating back and checking if cart persists

    // Navigate back to home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    await wait(1000)

    // Check if cart is still there after navigation
    const finalCartState = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest')
    })

    expect(finalCartState).toBeTruthy()
    const finalCart = JSON.parse(finalCartState!)

    // This is where the bug manifests:
    // The cart data exists in localStorage but the Zustand store may have been cleared
    console.log('Final cart state:', finalCart.state)

    // If the bug exists, setUserId would have cleared the items even though
    // userId didn't actually change (stayed null for guest)
    expect(finalCart.state.items.length).toBe(1)
  }, 60000)

  it('should show userId race condition in custom storage getItem', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })

    // Set up a cart with guest data
    await page.evaluate(() => {
      localStorage.clear()
      const guestCart = {
        state: {
          items: [{ id: '1', name: 'Item 1', price: 100, quantity: 1 }],
          userId: null,
          cartCount: 1,
          cartDetails: { '1': { id: '1', name: 'Item 1', price: 100, quantity: 1 } },
          totalPrice: 100,
          formattedTotalPrice: '$1.00',
        },
        version: 0,
      }
      localStorage.setItem('tatlist-cart-guest', JSON.stringify(guestCart))
    })

    // Track localStorage access attempts
    const storageAccessLog = await page.evaluate(() => {
      const log: string[] = []
      const originalGetItem = Storage.prototype.getItem

      Storage.prototype.getItem = function (key: string) {
        if (key.startsWith('tatlist-cart')) {
          log.push(`getItem called for key: ${key}`)
        }
        return originalGetItem.call(this, key)
      }

      return log
    })

    console.log('Storage access log:', storageAccessLog)

    // Reload page to trigger the bug
    await page.reload({ waitUntil: 'networkidle2' })
    await wait(1000)

    // Check which keys were accessed
    const finalLog = await page.evaluate(() => {
      // Return the log we set up earlier
      return (window as Window & { __storageLog?: string[] }).__storageLog || []
    })

    console.log('Storage access after reload:', finalLog)

    // The bug: getItem might be called with wrong key or before userId is set
    const cart = await page.evaluate(() => {
      const guestCart = localStorage.getItem('tatlist-cart-guest')
      return guestCart ? JSON.parse(guestCart) : null
    })

    // Cart data should still be present
    expect(cart).toBeTruthy()
    expect(cart?.state?.items?.length).toBeGreaterThan(0)
  }, 60000)

  it('should demonstrate setUserId clearing cart incorrectly', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })

    // Test the specific bug: setUserId is called even when userId doesn't actually change
    await page.evaluate(() => {
      localStorage.clear()

      // Set guest cart
      const guestCart = {
        state: {
          items: [{ id: 'prod-1', name: 'Product', price: 500, quantity: 1 }],
          userId: null, // Guest user
          cartCount: 1,
          cartDetails: { 'prod-1': { id: 'prod-1', name: 'Product', price: 500, quantity: 1 } },
          totalPrice: 500,
          formattedTotalPrice: '$5.00',
        },
        version: 0,
      }

      localStorage.setItem('tatlist-cart-guest', JSON.stringify(guestCart))
    })

    const initialCart = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest')
    })
    expect(initialCart).toBeTruthy()
    const parsed = JSON.parse(initialCart!)
    expect(parsed.state.items.length).toBe(1)

    console.log('Initial cart items:', parsed.state.items.length)

    // Navigate to trigger CartProvider re-initialization
    await page.reload({ waitUntil: 'networkidle2' })
    await wait(2000) // Wait longer for all effects to run

    // Check cart after reload
    const cartAfterReload = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest')
    })

    expect(cartAfterReload).toBeTruthy()
    const parsedAfter = JSON.parse(cartAfterReload!)

    console.log('Cart after reload:', parsedAfter.state)

    // THE BUG: If setUserId clears the cart even though userId is still null,
    // the cart items will be gone
    // This test should FAIL if the bug exists
    expect(parsedAfter.state.items.length).toBe(1)
    expect(parsedAfter.state.cartCount).toBe(1)
  }, 60000)
})
