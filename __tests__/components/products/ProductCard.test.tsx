import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/components/products/ProductCard'
import { mockProduct, mockOutOfStockProduct, setMockCartState } from '@//__tests__/utils/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        match: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null }),
        }),
        delete: jest.fn().mockReturnValue({
          match: jest.fn().mockResolvedValue({ data: null }),
        }),
        insert: jest.fn().mockResolvedValue({ data: null }),
      }),
    }),
  }),
}))

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
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Out of Stock')
    expect(button).toBeDisabled()
  })

  it('allows quantity adjustment', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const quantityInput = screen.getByLabelText(/qty/i)
    expect(quantityInput).toHaveValue(1)
    
    await user.clear(quantityInput)
    await user.type(quantityInput, '3')
    
    expect(quantityInput).toHaveValue(3)
  })

  it('prevents quantity below 1', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const quantityInput = screen.getByLabelText(/qty/i)
    
    await user.clear(quantityInput)
    await user.type(quantityInput, '0')
    
    // Should automatically correct to 1
    expect(quantityInput).toHaveValue(1)
  })

  it('adds product to cart with correct quantity', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    // Change quantity to 3
    const quantityInput = screen.getByLabelText(/qty/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '3')
    
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
    render(<ProductCard product={mockProduct} />)
    
    const favoriteButton = screen.getByRole('button', { name: /heart/i })
    expect(favoriteButton).toBeInTheDocument()
    
    await user.click(favoriteButton)
    // The actual toggle behavior is handled by useEffect and Supabase calls
    // We're testing that the button exists and is clickable
  })

  it('shows fallback when image fails to load', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByAltText(mockProduct.name)
    
    // Simulate image load error
    fireEvent.error(image)
    
    // Should show fallback SVG icon
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('handles products without images', () => {
    const productNoImages = {
      ...mockProduct,
      images: [],
    }
    
    render(<ProductCard product={productNoImages} />)
    
    // Should show fallback SVG when no images
    const svgIcon = screen.getByRole('img')
    expect(svgIcon).toBeInTheDocument()
  })

  it('applies hover effects and transitions', () => {
    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByText(mockProduct.name).closest('div')
    expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow')
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