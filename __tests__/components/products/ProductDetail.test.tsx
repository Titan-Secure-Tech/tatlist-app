import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetail from '@/components/products/ProductDetail'
import { mockProduct, setMockCartState } from '@//__tests__/utils/test-utils'

// Mock next/navigation is already set up in vitest.setup.ts
// Access the global mock router
declare global {
  var mockRouter: {
    push: ReturnType<typeof vi.fn>
    replace: ReturnType<typeof vi.fn>
    back: ReturnType<typeof vi.fn>
    refresh: ReturnType<typeof vi.fn>
  }
}

describe('ProductDetail', () => {
  const mockAddItem = vi.fn()

  beforeEach(() => {
    // Initialize mock cart state
    setMockCartState({
      cartCount: 0,
      cartDetails: {},
      formattedTotalPrice: '$0.00',
      totalPrice: 0,
    })

    // Set up mock function
    if (global.mockCartContext) {
      global.mockCartContext.addItem = mockAddItem
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders product details correctly', () => {
    render(<ProductDetail product={mockProduct} />)

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    expect(screen.getByText(`SKU: ${mockProduct.sku}`)).toBeInTheDocument()
    expect(screen.getByText(`Category: ${mockProduct.category}`)).toBeInTheDocument()
    expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
  })

  it('displays stock status correctly for in-stock products', () => {
    render(<ProductDetail product={mockProduct} />)

    const stockStatus = screen.getByText(`In Stock (${mockProduct.stock_quantity} available)`)
    expect(stockStatus).toBeInTheDocument()
    expect(stockStatus).toHaveClass('text-green-700')

    // Check for green status indicator dot
    const statusDot = stockStatus.previousElementSibling
    expect(statusDot).toHaveClass('bg-green-500')
  })

  it('displays stock status correctly for out-of-stock products', () => {
    const outOfStockProduct = {
      ...mockProduct,
      in_stock: false,
      stock_quantity: 0,
    }

    render(<ProductDetail product={outOfStockProduct} />)

    // Find the status text specifically (not the button text)
    const statusElements = screen.getAllByText('Out of Stock')
    const stockStatus = statusElements.find(el => el.tagName === 'SPAN')
    expect(stockStatus).toBeInTheDocument()
    expect(stockStatus).toHaveClass('text-red-700')

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i })
    expect(addToCartButton).toBeDisabled()
  })

  it('displays product images with navigation', async () => {
    const user = userEvent.setup()
    const productWithMultipleImages = {
      ...mockProduct,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    }

    const { container } = render(<ProductDetail product={productWithMultipleImages} />)

    // Main image should be displayed
    const mainImage = screen.getByAltText(`${mockProduct.name} - Image 1`)
    expect(mainImage).toBeInTheDocument()

    // Navigation buttons should be present (they don't have accessible names, so find by class/position)
    const navigationButtons = container.querySelectorAll(
      'button[class*="absolute"][class*="top-1/2"]'
    )
    const prevButton = Array.from(navigationButtons).find(btn => btn.classList.contains('left-2'))
    const nextButton = Array.from(navigationButtons).find(btn => btn.classList.contains('right-2'))
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()

    // Click next to change image
    await user.click(nextButton)

    const secondImage = screen.getByAltText(`${mockProduct.name} - Image 2`)
    expect(secondImage).toBeInTheDocument()
  })

  it('displays thumbnail gallery for multiple images', async () => {
    const user = userEvent.setup()
    const productWithMultipleImages = {
      ...mockProduct,
      images: Array(5)
        .fill('')
        .map((_, i) => `https://example.com/image${i + 1}.jpg`),
    }

    render(<ProductDetail product={productWithMultipleImages} />)

    // Should have thumbnail buttons
    const thumbnails = screen.getAllByRole('button', { name: /thumbnail/i })
    expect(thumbnails).toHaveLength(5)

    // Click on third thumbnail
    await user.click(thumbnails[2])

    const thirdImage = screen.getByAltText(`${mockProduct.name} - Image 3`)
    expect(thirdImage).toBeInTheDocument()
  })

  it('handles products without images', () => {
    const productNoImages = {
      ...mockProduct,
      images: [],
    }

    render(<ProductDetail product={productNoImages} />)

    // Should show fallback SVG
    expect(screen.queryByAltText(new RegExp(mockProduct.name))).not.toBeInTheDocument()
  })

  it('displays product tags when available', () => {
    render(<ProductDetail product={mockProduct} />)

    mockProduct.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('allows quantity adjustment with stock limits', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={mockProduct} />)

    const quantityInput = screen.getByLabelText(/quantity/i)
    expect(quantityInput).toHaveValue(1)
    expect(quantityInput).toHaveAttribute('max', mockProduct.stock_quantity.toString())

    await user.click(quantityInput)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('5')

    expect(quantityInput).toHaveValue(5)
  })

  it('adds product to cart with selected quantity', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={mockProduct} />)

    // Change quantity
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.click(quantityInput)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('3')

    // Add to cart
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await user.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price * 100,
      }),
      { count: 3 }
    )
  })

  it('displays source URL link when available', () => {
    render(<ProductDetail product={mockProduct} />)

    const sourceLink = screen.getByText('View on Lucky Supply →')
    expect(sourceLink).toBeInTheDocument()
    expect(sourceLink.closest('a')).toHaveAttribute('href', mockProduct.source_url)
    expect(sourceLink.closest('a')).toHaveAttribute('target', '_blank')
  })

  it('displays attachments section when available', () => {
    const productWithAttachments = {
      ...mockProduct,
      attachments: ['https://example.com/safety-sheet.pdf'],
    }

    render(<ProductDetail product={productWithAttachments} />)

    expect(screen.getByText('Downloads')).toBeInTheDocument()

    const attachmentLink = screen.getByText('safety-sheet.pdf')
    expect(attachmentLink).toBeInTheDocument()
    expect(attachmentLink.closest('a')).toHaveAttribute(
      'href',
      productWithAttachments.attachments[0]
    )
    expect(attachmentLink.closest('a')).toHaveAttribute('target', '_blank')
  })

  it('handles back button navigation', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={mockProduct} />)

    const backButton = screen.getByText('Back to Products')
    await user.click(backButton)

    expect(global.mockRouter.back).toHaveBeenCalled()
  })

  it('handles favorite button click', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProductDetail product={mockProduct} />)

    // Find the favorite button by looking for the heart icon
    const heartIcons = container.querySelectorAll('svg[class*="lucide-heart"]')
    expect(heartIcons.length).toBeGreaterThan(0)
    const favoriteButton = heartIcons[0].closest('button')
    expect(favoriteButton).toBeInTheDocument()

    await user.click(favoriteButton)
    // Just testing that the button is clickable
    // Actual favorite logic is complex and would need more mocking
  })

  it('prevents adding to cart when out of stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      in_stock: false,
      stock_quantity: 0,
    }

    render(<ProductDetail product={outOfStockProduct} />)

    const addButton = screen.getByRole('button', { name: /out of stock/i })
    expect(addButton).toBeDisabled()
  })

  it('handles products without tags gracefully', () => {
    const productNoTags = {
      ...mockProduct,
      tags: [],
    }

    render(<ProductDetail product={productNoTags} />)

    // Should not render tags section
    expect(screen.queryByText('professional')).not.toBeInTheDocument()
  })

  it('handles products without stock quantity', () => {
    const productNoStockQty = {
      ...mockProduct,
      stock_quantity: undefined,
    }

    render(<ProductDetail product={productNoStockQty} />)

    expect(screen.getByText('In Stock')).toBeInTheDocument()
    // Should not show quantity in parentheses
    expect(screen.queryByText(/\(\d+ available\)/)).not.toBeInTheDocument()
  })
})
