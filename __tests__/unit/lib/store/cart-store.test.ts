/**
 * Unit Tests for Zustand Cart Store
 * Tests all cart operations including add, remove, increment, decrement, and clear
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/store/cart-store'
import type { CartItem } from '@/lib/store/cart-store'

describe('Cart Store', () => {
  // Reset store before each test
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const item: CartItem = {
        id: 'test-1',
        name: 'Test Product',
        price: 1999, // $19.99 in cents
        quantity: 1,
      }

      useCartStore.getState().addItem(item)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0]).toEqual(item)
      expect(state.cartCount).toBe(1)
      expect(state.totalPrice).toBe(1999)
      expect(state.formattedTotalPrice).toBe('$19.99')
    })

    it('should increment quantity when adding an existing item', () => {
      const item: CartItem = {
        id: 'test-1',
        name: 'Test Product',
        price: 1999,
        quantity: 1,
      }

      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2)
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(3998)
      expect(state.formattedTotalPrice).toBe('$39.98')
    })

    it('should add item with custom count option', () => {
      const item: CartItem = {
        id: 'test-1',
        name: 'Test Product',
        price: 1000,
        quantity: 1,
      }

      useCartStore.getState().addItem(item, { count: 5 })

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(5)
      expect(state.cartCount).toBe(5)
      expect(state.totalPrice).toBe(5000)
    })

    it('should update cartDetails when adding items', () => {
      const item: CartItem = {
        id: 'test-1',
        name: 'Test Product',
        price: 1999,
        quantity: 1,
      }

      useCartStore.getState().addItem(item)

      const state = useCartStore.getState()
      expect(state.cartDetails['test-1']).toEqual(item)
    })

    it('should add multiple different items', () => {
      const item1: CartItem = { id: 'test-1', name: 'Product 1', price: 1000, quantity: 1 }
      const item2: CartItem = { id: 'test-2', name: 'Product 2', price: 2000, quantity: 1 }

      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(2)
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(3000)
    })
  })

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1999, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().removeItem('test-1')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state.formattedTotalPrice).toBe('$0.00')
    })

    it('should remove item from cartDetails', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1999, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().removeItem('test-1')

      const state = useCartStore.getState()
      expect(state.cartDetails['test-1']).toBeUndefined()
    })

    it('should not affect other items when removing one', () => {
      const item1: CartItem = { id: 'test-1', name: 'Product 1', price: 1000, quantity: 1 }
      const item2: CartItem = { id: 'test-2', name: 'Product 2', price: 2000, quantity: 1 }

      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)
      useCartStore.getState().removeItem('test-1')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('test-2')
      expect(state.totalPrice).toBe(2000)
    })
  })

  describe('incrementItem', () => {
    it('should increment item quantity by 1', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1000, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().incrementItem('test-1')

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(2)
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(2000)
    })

    it('should update cartDetails when incrementing', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1000, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().incrementItem('test-1')

      const state = useCartStore.getState()
      expect(state.cartDetails['test-1'].quantity).toBe(2)
    })
  })

  describe('decrementItem', () => {
    it('should decrement item quantity by 1', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1000, quantity: 3 }

      useCartStore.getState().addItem(item, { count: 3 })
      useCartStore.getState().decrementItem('test-1')

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(2)
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(2000)
    })

    it('should remove item when quantity reaches 0', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1000, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().decrementItem('test-1')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
    })

    it('should not allow negative quantities', () => {
      const item: CartItem = { id: 'test-1', name: 'Test Product', price: 1000, quantity: 1 }

      useCartStore.getState().addItem(item)
      useCartStore.getState().decrementItem('test-1')
      useCartStore.getState().decrementItem('test-1') // Try to decrement below 0

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.cartCount).toBe(0)
    })
  })

  describe('clearCart', () => {
    it('should clear all items from the cart', () => {
      const item1: CartItem = { id: 'test-1', name: 'Product 1', price: 1000, quantity: 1 }
      const item2: CartItem = { id: 'test-2', name: 'Product 2', price: 2000, quantity: 1 }

      useCartStore.getState().addItem(item1)
      useCartStore.getState().addItem(item2)
      useCartStore.getState().clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state.formattedTotalPrice).toBe('$0.00')
      expect(Object.keys(state.cartDetails)).toHaveLength(0)
    })
  })

  describe('price calculations', () => {
    it('should correctly calculate total price with multiple items', () => {
      const item1: CartItem = { id: 'test-1', name: 'Product 1', price: 1599, quantity: 2 }
      const item2: CartItem = { id: 'test-2', name: 'Product 2', price: 2999, quantity: 1 }

      useCartStore.getState().addItem(item1, { count: 2 })
      useCartStore.getState().addItem(item2)

      const state = useCartStore.getState()
      // (1599 * 2) + (2999 * 1) = 3198 + 2999 = 6197
      expect(state.totalPrice).toBe(6197)
      expect(state.formattedTotalPrice).toBe('$61.97')
    })

    it('should format prices correctly with cents', () => {
      const item: CartItem = { id: 'test-1', name: 'Product', price: 1050, quantity: 1 }

      useCartStore.getState().addItem(item)

      const state = useCartStore.getState()
      expect(state.formattedTotalPrice).toBe('$10.50')
    })

    it('should handle zero price items', () => {
      const item: CartItem = { id: 'test-1', name: 'Free Product', price: 0, quantity: 1 }

      useCartStore.getState().addItem(item)

      const state = useCartStore.getState()
      expect(state.totalPrice).toBe(0)
      expect(state.formattedTotalPrice).toBe('$0.00')
    })
  })

  describe('useShoppingCart hook', () => {
    it('should provide the same interface as useCartStore', () => {
      // This is already tested through the store, but we verify the hook exists
      const { useShoppingCart } = require('@/lib/store/cart-store')
      expect(useShoppingCart).toBeDefined()
    })
  })
})
