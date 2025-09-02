/**
 * Basic Cart Functionality Tests
 * Tests the core cart functionality to ensure stability
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CartProvider } from '@/components/providers/CartProvider'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

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
