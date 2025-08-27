/**
 * Basic Cart Functionality Tests
 * Tests the core cart functionality to ensure stability
 */

import { render, screen } from '@testing-library/react'
import { CartProvider } from '@/components/providers/CartProvider'

// Mock use-shopping-cart for basic tests
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: () => ({
    cartCount: 0,
    cartDetails: {},
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    formattedTotalPrice: '$0.00',
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, ...props }: any) => <a {...props}>{children}</a>
})

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
})

describe('Cart Basic Functionality', () => {
  it('CartProvider renders without crashing', () => {
    render(
      <CartProvider>
        <div>Test content</div>
      </CartProvider>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('imports work correctly', () => {
    expect(CartProvider).toBeDefined()
  })
})