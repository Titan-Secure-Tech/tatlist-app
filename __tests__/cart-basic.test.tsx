/**
 * Basic Cart Functionality Tests
 * Tests the core cart functionality to ensure stability
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CartProvider } from '@/components/providers/CartProvider'

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
