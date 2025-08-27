import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { mockProduct } from '@//__tests__/utils/test-utils'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}))

describe('AddToCartButton', () => {
  const mockAddItem = jest.fn()
  
  beforeEach(() => {
    global.mockCartContext.addItem = mockAddItem
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders add to cart button with default props', () => {
    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('adds product to cart when clicked', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    expect(mockAddItem).toHaveBeenCalledWith(
      {
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price * 100, // converted to cents
        currency: 'USD',
        image: mockProduct.images[0],
        description: mockProduct.description,
        price_data: {
          currency: 'USD',
          product_data: {
            name: mockProduct.name,
            description: mockProduct.description,
            images: mockProduct.images,
          },
          unit_amount: mockProduct.price * 100,
        },
      },
      { count: 1 }
    )
  })

  it('adds custom quantity when specified', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} quantity={3} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.any(Object),
      { count: 3 }
    )
  })

  it('shows "Added!" state temporarily after clicking', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    // Should show "Added!" state
    expect(screen.getByRole('button', { name: /added!/i })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
    
    // Should revert back after timeout
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
        expect(screen.getByRole('button')).not.toBeDisabled()
      },
      { timeout: 1000 }
    )
  })

  it('can be disabled', () => {
    render(<AddToCartButton product={mockProduct} disabled />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeDisabled()
  })

  it('hides icon when showIcon is false', () => {
    render(<AddToCartButton product={mockProduct} showIcon={false} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeInTheDocument()
    // The icon should not be present (testing by checking button text content)
    expect(button.textContent).toBe('Add to Cart')
  })

  it('applies custom className', () => {
    render(<AddToCartButton product={mockProduct} className="custom-class" />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toHaveClass('custom-class')
  })

  it('handles products without images gracefully', async () => {
    const productWithoutImages = {
      ...mockProduct,
      images: [],
    }
    
    const user = userEvent.setup()
    render(<AddToCartButton product={productWithoutImages} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        image: undefined,
        price_data: expect.objectContaining({
          product_data: expect.objectContaining({
            images: [],
          }),
        }),
      }),
      { count: 1 }
    )
  })

  it('calls toast.success when item is added', async () => {
    const { toast } = require('sonner')
    const user = userEvent.setup()
    
    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    expect(toast.success).toHaveBeenCalledWith(
      `${mockProduct.name} added to cart!`,
      expect.objectContaining({
        description: 'Continue shopping or view your cart',
        action: expect.objectContaining({
          label: 'View Cart',
          onClick: expect.any(Function),
        }),
      })
    )
  })

  it('supports different button variants', () => {
    render(<AddToCartButton product={mockProduct} variant="outline" />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeInTheDocument()
  })

  it('supports different button sizes', () => {
    render(<AddToCartButton product={mockProduct} size="sm" />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeInTheDocument()
  })
})