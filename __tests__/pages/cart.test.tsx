import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from '@/app/(dashboard)/cart/page'
import { setMockCartState, createMockCartItem } from '@//__tests__/utils/test-utils'

describe('Cart Page', () => {
  const mockRemoveItem = jest.fn()
  const mockIncrementItem = jest.fn()
  const mockDecrementItem = jest.fn()
  const mockClearCart = jest.fn()

  beforeEach(() => {
    // Ensure global.mockCartContext exists
    if (!global.mockCartContext) {
      global.mockCartContext = {
        cartCount: 0,
        cartDetails: {},
        addItem: jest.fn(),
        removeItem: jest.fn(),
        incrementItem: jest.fn(),
        decrementItem: jest.fn(),
        clearCart: jest.fn(),
        formattedTotalPrice: '$0.00',
        totalPrice: 0,
      }
    }

    global.mockCartContext.removeItem = mockRemoveItem
    global.mockCartContext.incrementItem = mockIncrementItem
    global.mockCartContext.decrementItem = mockDecrementItem
    global.mockCartContext.clearCart = mockClearCart
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Empty Cart', () => {
    beforeEach(() => {
      setMockCartState({
        cartCount: 0,
        cartDetails: {},
        formattedTotalPrice: '$0.00',
      })
    })

    it('displays empty cart message', () => {
      render(<CartPage />)

      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument()
      expect(screen.getByText('Start adding products to your cart')).toBeInTheDocument()
    })

    it('shows browse products link when empty', () => {
      render(<CartPage />)

      const browseLink = screen.getByText('Browse Products')
      expect(browseLink).toBeInTheDocument()
      expect(browseLink.closest('a')).toHaveAttribute('href', '/products')
    })
  })

  describe('Cart with Items', () => {
    const mockItems = {
      'item-1': createMockCartItem({
        id: 'item-1',
        name: 'Tattoo Machine Pro',
        price: 29999, // $299.99 in cents
        quantity: 1,
        image: 'https://example.com/machine.jpg',
      }),
      'item-2': createMockCartItem({
        id: 'item-2',
        name: 'Black Ink Set',
        price: 4999, // $49.99 in cents
        quantity: 2,
        image: 'https://example.com/ink.jpg',
      }),
    }

    beforeEach(() => {
      setMockCartState({
        cartCount: 3,
        cartDetails: mockItems,
        formattedTotalPrice: '$399.97',
      })
    })

    it('displays cart items correctly', () => {
      render(<CartPage />)

      expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
      expect(screen.getByText('Tattoo Machine Pro')).toBeInTheDocument()
      expect(screen.getByText('Black Ink Set')).toBeInTheDocument()

      // Check prices (divided by 100 to convert from cents)
      expect(screen.getByText('$299.99 each')).toBeInTheDocument()
      expect(screen.getByText('$49.99 each')).toBeInTheDocument()
    })

    it('displays item quantities correctly', () => {
      render(<CartPage />)

      const quantities = screen.getAllByText(/^\d+$/)
      expect(quantities).toHaveLength(2)

      // First item has quantity 1, second has quantity 2
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('displays item totals correctly', () => {
      render(<CartPage />)

      // Item 1: $299.99 * 1 = $299.99
      expect(screen.getByText('$299.99')).toBeInTheDocument()

      // Item 2: $49.99 * 2 = $99.98
      expect(screen.getByText('$99.98')).toBeInTheDocument()
    })

    it('displays cart total', () => {
      render(<CartPage />)

      expect(screen.getByText('Total:')).toBeInTheDocument()
      expect(screen.getByText('$399.97')).toBeInTheDocument()
    })

    it('displays product images', () => {
      render(<CartPage />)

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)

      expect(images[0]).toHaveAttribute('src', mockItems['item-1'].image)
      expect(images[1]).toHaveAttribute('src', mockItems['item-2'].image)
    })
  })

  describe('Cart Actions', () => {
    const mockItems = {
      'item-1': createMockCartItem({
        id: 'item-1',
        name: 'Test Item',
        price: 1999,
        quantity: 2,
      }),
    }

    beforeEach(() => {
      setMockCartState({
        cartCount: 2,
        cartDetails: mockItems,
        formattedTotalPrice: '$39.98',
      })
    })

    it('increments item quantity when plus button clicked', async () => {
      const user = userEvent.setup()
      render(<CartPage />)

      const plusButton = screen.getByText('+')
      await user.click(plusButton)

      expect(mockIncrementItem).toHaveBeenCalledWith('item-1')
    })

    it('decrements item quantity when minus button clicked', async () => {
      const user = userEvent.setup()
      render(<CartPage />)

      const minusButton = screen.getByText('-')
      await user.click(minusButton)

      expect(mockDecrementItem).toHaveBeenCalledWith('item-1')
    })

    it('removes item when delete button clicked', async () => {
      const user = userEvent.setup()
      render(<CartPage />)

      const deleteButton = screen.getByRole('button', { name: /remove.*from cart/i })
      await user.click(deleteButton)

      expect(mockRemoveItem).toHaveBeenCalledWith('item-1')
    })

    it('clears entire cart when clear button clicked', async () => {
      const user = userEvent.setup()
      render(<CartPage />)

      const clearButton = screen.getByText('Clear Cart')
      await user.click(clearButton)

      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  describe('Checkout', () => {
    let mockConsole: jest.SpyInstance

    beforeEach(() => {
      const mockItems = {
        'item-1': createMockCartItem({
          id: 'item-1',
          name: 'Test Item',
          price: 1999,
          quantity: 1,
        }),
      }

      setMockCartState({
        cartCount: 1,
        cartDetails: mockItems,
        formattedTotalPrice: '$19.99',
      })

      // Create fresh mock for each test
      mockConsole = jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      mockConsole?.mockRestore()
    })

    it('displays checkout button', () => {
      render(<CartPage />)

      const checkoutButton = screen.getByText('Proceed to Checkout')
      expect(checkoutButton).toBeInTheDocument()
    })

    it('handles checkout button click', async () => {
      const user = userEvent.setup()
      render(<CartPage />)

      const checkoutButton = screen.getByText('Proceed to Checkout')
      await user.click(checkoutButton)

      expect(mockConsole).toHaveBeenCalledWith('Checkout with cart:', expect.any(Object))
      // Toast notification is called but we don't need to test it explicitly
    })
  })

  describe('Responsive Design', () => {
    const mockItems = {
      'item-1': createMockCartItem({
        id: 'item-1',
        name: 'Test Item with Very Long Name That Should Wrap',
        price: 1999,
        quantity: 1,
      }),
    }

    beforeEach(() => {
      setMockCartState({
        cartCount: 1,
        cartDetails: mockItems,
        formattedTotalPrice: '$19.99',
      })
    })

    it('displays cart items in proper layout', () => {
      render(<CartPage />)

      // Check that items are in a proper container structure
      const cartContainer = screen
        .getByText('Test Item with Very Long Name That Should Wrap')
        .closest('div[class*="p-4"]')

      expect(cartContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    const mockItems = {
      'item-1': createMockCartItem({
        id: 'item-1',
        name: 'Accessible Test Item',
        price: 1999,
        quantity: 1,
      }),
    }

    beforeEach(() => {
      setMockCartState({
        cartCount: 1,
        cartDetails: mockItems,
        formattedTotalPrice: '$19.99',
      })
    })

    it('has proper heading structure', () => {
      render(<CartPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Shopping Cart')
    })

    it('has accessible buttons with proper labels', () => {
      render(<CartPage />)

      expect(screen.getByRole('button', { name: /clear cart/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /remove.*from cart/i })).toBeInTheDocument()
    })

    it('has proper alt text for images', () => {
      render(<CartPage />)

      const productImage = screen.getByAltText('Accessible Test Item')
      expect(productImage).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing product images gracefully', () => {
      const itemsWithoutImages = {
        'item-1': createMockCartItem({
          id: 'item-1',
          name: 'No Image Item',
          price: 1999,
          quantity: 1,
          image: undefined,
        }),
      }

      setMockCartState({
        cartCount: 1,
        cartDetails: itemsWithoutImages,
        formattedTotalPrice: '$19.99',
      })

      render(<CartPage />)

      expect(screen.getByText('No Image Item')).toBeInTheDocument()
      // Should not crash without image
    })

    it('handles zero price items', () => {
      const freeItems = {
        'item-1': createMockCartItem({
          id: 'item-1',
          name: 'Free Item',
          price: 0,
          quantity: 1,
        }),
      }

      setMockCartState({
        cartCount: 1,
        cartDetails: freeItems,
        formattedTotalPrice: '$0.00',
      })

      render(<CartPage />)

      expect(screen.getByText('$0.00 each')).toBeInTheDocument()
      expect(screen.getByText('Total:')).toBeInTheDocument()
    })
  })
})
