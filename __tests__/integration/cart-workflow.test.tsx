import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartIcon } from '@/components/cart/cart-icon'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import ProductCard from '@/components/products/ProductCard'
import { mockProduct, setMockCartState, createMockCartItem } from '@//__tests__/utils/test-utils'

describe('Cart Workflow Integration', () => {
  const mockAddItem = jest.fn()
  const mockRemoveItem = jest.fn()
  const mockIncrementItem = jest.fn()
  const mockDecrementItem = jest.fn()
  const mockClearCart = jest.fn()

  beforeEach(() => {
    global.mockCartContext.addItem = mockAddItem
    global.mockCartContext.removeItem = mockRemoveItem
    global.mockCartContext.incrementItem = mockIncrementItem
    global.mockCartContext.decrementItem = mockDecrementItem
    global.mockCartContext.clearCart = mockClearCart

    setMockCartState({
      cartCount: 0,
      cartDetails: {},
      formattedTotalPrice: '$0.00',
      totalPrice: 0,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Empty Cart State', () => {
    it('shows empty cart icon and allows adding items', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <CartIcon />
          <AddToCartButton product={mockProduct} />
        </div>
      )

      // Initially empty cart - badge should not be visible for empty cart
      expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument()
      // Screen reader text should show 0 items
      expect(screen.getByText(/open cart \(0 items\)/i)).toBeInTheDocument()

      // Add item to cart
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await user.click(addButton)

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price * 100,
        }),
        { count: 1 }
      )
    })
  })

  describe('Cart State Updates', () => {
    it('updates cart icon when items are added', () => {
      // Simulate having items in cart
      setMockCartState({ cartCount: 3 })

      render(<CartIcon />)

      // Badge should display count
      expect(screen.getByTestId('cart-badge')).toBeInTheDocument()
      expect(screen.getByTestId('cart-badge')).toHaveTextContent('3')
      // Screen reader text should show 3 items
      expect(screen.getByText(/open cart \(3 items\)/i)).toBeInTheDocument()
    })

    it('handles large cart counts correctly', () => {
      setMockCartState({ cartCount: 150 })

      render(<CartIcon />)

      expect(screen.getByText('99+')).toBeInTheDocument()
    })
  })

  describe('Product Card Integration', () => {
    it('integrates product card with cart system', async () => {
      const user = userEvent.setup()

      render(<ProductCard product={mockProduct} />)

      // Product should display correctly
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
      expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()

      // Adjust quantity - use selectAll + type to ensure proper replacement
      const quantityInput = screen.getByLabelText(/qty/i) as HTMLInputElement
      await user.click(quantityInput)
      await user.keyboard('{Control>}a{/Control}')
      await user.keyboard('2')
      // Verify input value is correct
      expect(quantityInput.value).toBe('2')

      // Add to cart with quantity
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await user.click(addButton)

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProduct.id,
          price: mockProduct.price * 100,
        }),
        { count: 2 }
      )
    })
  })

  describe('Cart State Consistency', () => {
    it('maintains consistent state across components', () => {
      const cartItems = {
        'test-item-1': createMockCartItem({
          id: 'test-item-1',
          name: 'Test Item 1',
          quantity: 2,
        }),
        'test-item-2': createMockCartItem({
          id: 'test-item-2',
          name: 'Test Item 2',
          quantity: 1,
        }),
      }

      setMockCartState({
        cartCount: 3,
        cartDetails: cartItems,
        formattedTotalPrice: '$59.97',
        totalPrice: 5997,
      })

      render(
        <div>
          <CartIcon />
          <AddToCartButton product={mockProduct} />
        </div>
      )

      // Cart icon should reflect total count
      expect(screen.getByText('3')).toBeInTheDocument()

      // Add button should still be functional
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      expect(addButton).not.toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('handles add to cart failures gracefully', async () => {
      const user = userEvent.setup()

      // Mock addItem to throw error
      mockAddItem.mockImplementationOnce(() => {
        throw new Error('Failed to add item')
      })

      render(<AddToCartButton product={mockProduct} />)

      const addButton = screen.getByRole('button', { name: /add to cart/i })

      // Should not crash when error occurs
      await user.click(addButton)

      expect(mockAddItem).toHaveBeenCalled()
      // Button should still be functional after error
      expect(addButton).not.toBeDisabled()
    })
  })

  describe('Price Handling', () => {
    it('correctly converts prices to cents for use-shopping-cart', async () => {
      const user = userEvent.setup()
      const expensiveProduct = {
        ...mockProduct,
        price: 1299.99,
      }

      render(<AddToCartButton product={expensiveProduct} />)

      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await user.click(addButton)

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 129999, // $1299.99 * 100 = 129999 cents
          price_data: expect.objectContaining({
            unit_amount: 129999,
          }),
        }),
        { count: 1 }
      )
    })

    it('handles decimal prices correctly', async () => {
      const user = userEvent.setup()
      const decimalProduct = {
        ...mockProduct,
        price: 19.99,
      }

      render(<AddToCartButton product={decimalProduct} />)

      const addButton = screen.getByRole('button', { name: /add to cart/i })
      await user.click(addButton)

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 1999, // $19.99 * 100 = 1999 cents
        }),
        { count: 1 }
      )
    })
  })

  describe('Accessibility', () => {
    it('maintains proper ARIA attributes across cart components', () => {
      setMockCartState({ cartCount: 5 })

      render(
        <div>
          <CartIcon />
          <AddToCartButton product={mockProduct} />
        </div>
      )

      // Cart icon should have proper labels (screen reader text)
      expect(screen.getByText(/open cart \(5 items\)/i)).toBeInTheDocument()

      // Add button should be accessible
      const addButton = screen.getByRole('button', { name: /add to cart/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('handles rapid successive clicks without issues', async () => {
      const user = userEvent.setup()

      render(<AddToCartButton product={mockProduct} />)

      const addButton = screen.getByRole('button', { name: /add to cart/i })

      // Click multiple times - the button becomes temporarily disabled after each click
      await user.click(addButton)
      expect(mockAddItem).toHaveBeenCalledTimes(1)

      // Wait for button to reset and click again
      await screen.findByText('Add to Cart', undefined, { timeout: 1000 })
      await user.click(addButton)
      expect(mockAddItem).toHaveBeenCalledTimes(2)

      // Wait and click once more
      await screen.findByText('Add to Cart', undefined, { timeout: 1000 })
      await user.click(addButton)
      expect(mockAddItem).toHaveBeenCalledTimes(3)
    })
  })
})
