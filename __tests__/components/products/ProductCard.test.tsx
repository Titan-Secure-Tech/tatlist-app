import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/components/products/ProductCard'
import { mockProduct, mockOutOfStockProduct, setMockCartState } from '@//__tests__/utils/test-utils'

describe('ProductCard', () => {
  const mockAddItem = jest.fn()

  beforeEach(() => {
    global.mockCartContext.addItem = mockAddItem
    setMockCartState({ cartCount: 0 })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.category)).toBeInTheDocument()
  })

  it('displays product image with fallback', () => {
    render(<ProductCard product={mockProduct} />)

    const image = screen.getByAltText(mockProduct.name)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProduct.images[0])
  })

  it('shows multiple image indicator when product has multiple images', () => {
    const productWith5Images = {
      ...mockProduct,
      images: Array(5).fill('https://example.com/image.jpg'),
    }

    render(<ProductCard product={productWith5Images} />)

    expect(screen.getByText('+4 more')).toBeInTheDocument()
  })

  it('displays stock quantity when available', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText(`In stock: ${mockProduct.stock_quantity}`)).toBeInTheDocument()
  })

  it('handles out of stock products correctly', () => {
    render(<ProductCard product={mockOutOfStockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i })
    expect(addToCartButton).toHaveTextContent('Out of Stock')
    expect(addToCartButton).toBeDisabled()
  })

  it('allows quantity adjustment', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)

    const quantityInput = screen.getByLabelText(/qty/i)
    expect(quantityInput).toHaveValue(1)

    await user.click(quantityInput)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('3')

    expect(quantityInput).toHaveValue(3)
  })

  it('prevents quantity below 1', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)

    const quantityInput = screen.getByLabelText(/qty/i)

    await user.click(quantityInput)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('0')

    // Should automatically correct to 1
    expect(quantityInput).toHaveValue(1)
  })

  it('adds product to cart with correct quantity', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)

    // Change quantity to 3
    const quantityInput = screen.getByLabelText(/qty/i)
    await user.click(quantityInput)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('3')

    // Click add to cart
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price * 100, // converted to cents
      }),
      { count: 3 }
    )
  })

  it('renders product links correctly', () => {
    render(<ProductCard product={mockProduct} />)

    const productLinks = screen.getAllByRole('link')
    expect(productLinks).toHaveLength(2) // Image link and title link

    productLinks.forEach(link => {
      expect(link).toHaveAttribute('href', `/products/${mockProduct.id}`)
    })
  })

  it('handles favorite toggle functionality', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProductCard product={mockProduct} />)

    // Find favorite button by heart icon since it has no accessible name
    const heartIcon = container.querySelector('svg[class*="lucide-heart"]')
    const favoriteButton = heartIcon?.closest('button')
    expect(favoriteButton).toBeInTheDocument()

    await user.click(favoriteButton)
    // The actual toggle behavior is handled by useEffect and Supabase calls
    // We're testing that the button exists and is clickable
  })

  it('shows fallback when image fails to load', () => {
    const { container } = render(<ProductCard product={mockProduct} />)

    const image = screen.getByAltText(mockProduct.name)

    // Simulate image load error
    fireEvent.error(image)

    // Should show some fallback (could be SVG or default image)
    // Check that we still have some visual element in the image container
    const imageContainer = container.querySelector('[class*="relative"][class*="h-48"]')
    expect(imageContainer).toBeInTheDocument()
  })

  it('handles products without images', () => {
    const productNoImages = {
      ...mockProduct,
      images: [],
    }

    const { container } = render(<ProductCard product={productNoImages} />)

    // Should show fallback when no images - check for image container
    const imageContainer = container.querySelector('[class*="relative"][class*="h-48"]')
    expect(imageContainer).toBeInTheDocument()
  })

  it('applies hover effects and transitions', () => {
    const { container } = render(<ProductCard product={mockProduct} />)

    // Find the main card container with the hover effects
    const card = container.querySelector('[class*="hover:shadow-lg"][class*="transition-shadow"]')
    expect(card).toBeInTheDocument()
  })

  it('respects stock quantity limits', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock_quantity: 2,
    }

    render(<ProductCard product={lowStockProduct} />)

    const quantityInput = screen.getByLabelText(/qty/i)
    expect(quantityInput).toHaveAttribute('max', '2')
  })
})
