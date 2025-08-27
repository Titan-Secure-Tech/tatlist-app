import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { CartProvider } from '@/components/providers/CartProvider'

// Mock product data
export const mockProduct = {
  id: 'test-product-1',
  sku: 'TEST-001',
  name: 'Test Tattoo Machine',
  description: 'A high-quality test tattoo machine for professional use',
  price: 299.99,
  image: 'https://example.com/image1.jpg', // Added for AddToCartButton compatibility
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  category: 'Tattoo Machines',
  brand: 'Lucky Supply',
  in_stock: true,
  stock_quantity: 10,
  tags: ['professional', 'tattoo', 'machine'],
  attachments: [],
  source_url: 'https://luckysupplyusa.com/products/test-product'
}

export const mockProductWithVariants = {
  ...mockProduct,
  id: 'test-product-2',
  name: 'Test Ink Set',
  price: 49.99,
  images: [
    'https://example.com/ink1.jpg',
    'https://example.com/ink2.jpg',
    'https://example.com/ink3.jpg'
  ],
  variants: [
    { title: 'Black', sku: 'INK-BLACK', price: 49.99, available: true },
    { title: 'Blue', sku: 'INK-BLUE', price: 49.99, available: true },
    { title: 'Red', sku: 'INK-RED', price: 49.99, available: false }
  ]
}

export const mockOutOfStockProduct = {
  ...mockProduct,
  id: 'test-product-3',
  name: 'Out of Stock Item',
  in_stock: false,
  stock_quantity: 0
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockCartItem = (overrides = {}) => ({
  id: 'test-item-1',
  name: 'Test Item',
  price: 2999, // price in cents for use-shopping-cart
  currency: 'USD',
  image: 'https://example.com/image.jpg',
  quantity: 1,
  ...overrides
})

export const setMockCartState = (cartState: any) => {
  Object.assign(global.mockCartContext, cartState)
}

// Simple test to prevent empty test suite error
describe('Test Utils', () => {
  it('should export mock product data', () => {
    expect(mockProduct).toBeDefined()
    expect(mockProduct.id).toBe('test-product-1')
  })
})