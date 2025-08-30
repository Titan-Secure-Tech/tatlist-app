/**
 * Basic Cart Functionality Tests
 * Tests the core cart functionality to ensure stability
 */

import { render, screen } from '@testing-library/react'
import { CartProvider } from '@/components/providers/CartProvider'

// Mock Next.js components
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <a {...props}>{children}</a>
  )
})

jest.mock('next/image', () => {
  // eslint-disable-next-line react/display-name
  return ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
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
