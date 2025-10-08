/**
 * E2E Test: Checkout Flow - Cart State Persistence
 *
 * RED PHASE: This test should FAIL due to a race condition in the cart store's
 * custom storage implementation that causes cart items to disappear when
 * navigating to the checkout page.
 *
 * The bug occurs because:
 * 1. Cart state uses userId-based localStorage keys
 * 2. When navigating to checkout, the CartProvider re-initializes
 * 3. The custom storage getItem() is called before userId is set
 * 4. This causes cart to load from wrong localStorage key or empty state
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

// Helper function to wait for a specified amount of time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Checkout Flow E2E - Cart State Persistence', () => {
  let browser: Browser
  let page: Page
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7500'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }, 30000)

  afterAll(async () => {
    await browser?.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    // Clear localStorage before each test to ensure clean state
    await page.goto(BASE_URL)
    await page.evaluate(() => {
      localStorage.clear()
    })
  }, 30000)

  it('should persist cart items when navigating to checkout page', async () => {
    // ARRANGE: Navigate to shop page
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle2' })

    // Wait for products to load - look for the products grid
    await page.waitForSelector('.grid', { timeout: 15000 })

    // Wait an additional second for React to hydrate
    await wait(1000)

    // Get initial cart count (should be 0)
    const initialCartCount = await page.evaluate(() => {
      const cartButton = document.querySelector('a[href="/checkout"]')
      return cartButton?.textContent?.match(/\d+/)?.[0] || '0'
    })
    expect(initialCartCount).toBe('0')

    // ACT: Add first available product to cart - find button containing "Add to Cart"
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'))
        return buttons.some(btn => btn.textContent?.includes('Add to Cart'))
      },
      { timeout: 10000 }
    )

    const addToCartButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find(btn => btn.textContent?.includes('Add to Cart'))
    })

    expect(addToCartButton).toBeTruthy()

    // Click the "Add to Cart" button
    await addToCartButton!.click()

    // Wait for cart to update (look for success toast or cart count change)
    await page.waitForFunction(
      () => {
        const cartButton =
          document.querySelector('a[href="/checkout"]') ||
          document.querySelector('[href="/checkout"]')
        const text = cartButton?.textContent || ''
        const match = text.match(/\d+/)
        return match && parseInt(match[0]) > 0
      },
      { timeout: 5000 }
    )

    // ASSERT: Verify cart count increased
    const cartCountAfterAdd = await page.evaluate(() => {
      const cartButton =
        document.querySelector('a[href="/checkout"]') ||
        document.querySelector('[href="/checkout"]')
      return cartButton?.textContent?.match(/\d+/)?.[0] || '0'
    })
    expect(parseInt(cartCountAfterAdd)).toBeGreaterThan(0)
    const expectedCartCount = parseInt(cartCountAfterAdd)

    // Get cart items from localStorage before navigation
    const cartBeforeNavigation = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('tatlist-cart'))
      const cartData: Record<string, unknown> = {}
      keys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          cartData[key] = JSON.parse(value)
        }
      })
      return cartData
    })

    console.log('Cart data before navigation:', cartBeforeNavigation)

    // ACT: Click "Proceed to Checkout" button
    const checkoutButton = await page.waitForSelector('a[href="/checkout"]', {
      timeout: 5000,
    })
    await checkoutButton!.click()

    // Wait for checkout page to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    expect(page.url()).toContain('/checkout')

    // Wait for page to be fully rendered - wait for h1 element
    await page.waitForSelector('h1', { timeout: 5000 })

    // Get cart items from localStorage after navigation
    const cartAfterNavigation = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('tatlist-cart'))
      const cartData: Record<string, unknown> = {}
      keys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          cartData[key] = JSON.parse(value)
        }
      })
      return cartData
    })

    console.log('Cart data after navigation:', cartAfterNavigation)

    // Wait a moment for cart to fully load
    await wait(1000)

    // ASSERT: Verify cart is NOT showing "empty cart" message
    // This assertion should FAIL with the current implementation
    const hasEmptyCartMessage = await page.evaluate(() => {
      const heading = document.querySelector('h1')
      return heading?.textContent?.includes('Your Cart is Empty') || false
    })
    expect(hasEmptyCartMessage).toBe(false)

    // ASSERT: Verify cart count is still correct on checkout page
    // This assertion should FAIL - cart count will be 0 due to race condition
    const cartCountOnCheckout = await page.evaluate(() => {
      // Check badge or cart display
      const cartBadge = document.querySelector('[data-testid="cart-count"]')
      if (cartBadge) return cartBadge.textContent || '0'

      // Check order summary
      const orderSummary = document.querySelector('[data-testid="order-summary"]')
      if (orderSummary) {
        const items = orderSummary.querySelectorAll('[data-testid="cart-item"]')
        return items.length.toString()
      }

      // Fallback: check for any cart items displayed
      const cartItems = document.querySelectorAll('.flex.justify-between.text-sm')
      return cartItems.length.toString()
    })

    expect(parseInt(cartCountOnCheckout)).toBe(expectedCartCount)

    // ASSERT: Verify order summary shows cart items
    // This assertion should FAIL - order summary will be empty
    const orderSummaryItems = await page.evaluate(() => {
      // Look for cart items in order summary
      const items = document.querySelectorAll('.flex.justify-between.text-sm')
      return Array.from(items).map(item => ({
        text: item.textContent?.trim() || '',
        visible: item.checkVisibility?.() !== false,
      }))
    })

    console.log('Order summary items found:', orderSummaryItems.length)
    expect(orderSummaryItems.length).toBeGreaterThan(0)

    // ASSERT: Verify order total is displayed and greater than 0
    // This assertion should FAIL - total will be $0.00 or NaN
    const orderTotal = await page.evaluate(() => {
      // Look for total in various places
      const totalElements = Array.from(document.querySelectorAll('*')).filter(
        el => el.textContent?.includes('Total') && el.textContent?.includes('$')
      )

      if (totalElements.length > 0) {
        const totalText = totalElements[0].textContent || ''
        const match = totalText.match(/\$[\d,.]+/)
        return match ? match[0] : '$0.00'
      }

      return '$0.00'
    })

    console.log('Order total displayed:', orderTotal)
    expect(orderTotal).not.toBe('$0.00')
    expect(orderTotal).not.toBe('$NaN')
  }, 60000)

  it('should maintain cart state for guest users across page navigation', async () => {
    // This test verifies guest cart persistence
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle2' })

    // Wait for page to load
    await page.waitForSelector('.grid', { timeout: 15000 })
    await wait(1000)

    // Verify we're in guest mode (no auth)
    const isGuest = await page.evaluate(() => {
      return !document.cookie.includes('sb-')
    })
    expect(isGuest).toBe(true)

    // Add product to cart
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'))
        return buttons.some(btn => btn.textContent?.includes('Add to Cart'))
      },
      { timeout: 10000 }
    )

    const addButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find(btn => btn.textContent?.includes('Add to Cart'))
    })
    await addButton!.click()

    await page.waitForFunction(
      () => {
        const cartBtn = document.querySelector('[href="/checkout"]')
        return (cartBtn?.textContent?.match(/\d+/)?.[0] || '0') !== '0'
      },
      { timeout: 5000 }
    )

    // Check guest cart key exists in localStorage
    const guestCartExists = await page.evaluate(() => {
      return localStorage.getItem('tatlist-cart-guest') !== null
    })
    expect(guestCartExists).toBe(true)

    // Navigate to checkout
    await page.click('a[href="/checkout"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    // Verify guest cart is still accessible
    const guestCartAfterNav = await page.evaluate(() => {
      const cartData = localStorage.getItem('tatlist-cart-guest')
      return cartData ? JSON.parse(cartData) : null
    })

    expect(guestCartAfterNav).toBeTruthy()
    expect(guestCartAfterNav?.state?.items?.length).toBeGreaterThan(0)
  }, 60000)

  it('should show error message when cart state is lost during checkout', async () => {
    // This test documents the bug behavior
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle2' })

    // Wait for page to load
    await page.waitForSelector('.grid', { timeout: 15000 })
    await wait(1000)

    // Add item to cart
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'))
        return buttons.some(btn => btn.textContent?.includes('Add to Cart'))
      },
      { timeout: 10000 }
    )

    const addButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find(btn => btn.textContent?.includes('Add to Cart'))
    })
    await addButton!.click()

    await page.waitForFunction(
      () =>
        (document.querySelector('[href="/checkout"]')?.textContent?.match(/\d+/)?.[0] || '0') !==
        '0',
      { timeout: 5000 }
    )

    // Get cart state before navigation
    const stateBeforeNav = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      return keys
        .filter(k => k.includes('tatlist-cart'))
        .map(key => ({
          key,
          value: localStorage.getItem(key),
        }))
    })

    // Navigate to checkout
    await page.click('a[href="/checkout"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    // Get cart state after navigation
    const stateAfterNav = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      return keys
        .filter(k => k.includes('tatlist-cart'))
        .map(key => ({
          key,
          value: localStorage.getItem(key),
        }))
    })

    // Log the state difference for debugging
    console.log('=== CART STATE DEBUG ===')
    console.log('Before navigation:', stateBeforeNav)
    console.log('After navigation:', stateAfterNav)

    // The bug: cart data exists in localStorage but is not loaded into the store
    expect(stateAfterNav.length).toBeGreaterThan(0)

    // But the UI shows empty cart (this documents the bug)
    const showsEmptyState = await page.evaluate(() => {
      return document.body.textContent?.includes('Your Cart is Empty') || false
    })

    // This is the bug we're testing for - state exists but isn't loaded
    if (showsEmptyState) {
      console.log('BUG CONFIRMED: Cart data exists in localStorage but UI shows empty cart')
    }

    expect(showsEmptyState).toBe(false) // This should FAIL, documenting the bug
  }, 60000)
})
