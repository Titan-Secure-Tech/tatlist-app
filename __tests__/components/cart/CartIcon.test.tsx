import { render, screen } from '@testing-library/react'
import { CartIcon } from '@/components/cart/cart-icon'
import { setMockCartState } from '@//__tests__/utils/test-utils'

describe('CartIcon', () => {
  beforeEach(() => {
    setMockCartState({ cartCount: 0 })
  })

  it('renders cart icon with no badge when cart is empty', () => {
    render(<CartIcon />)
    
    const cartButton = screen.getByRole('link')
    expect(cartButton).toBeInTheDocument()
    expect(cartButton).toHaveAttribute('href', '/cart')
    
    const cartIcon = screen.getByText('Open cart (0 items)')
    expect(cartIcon).toBeInTheDocument()
    
    // Should not show badge when cart is empty
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders cart icon with badge when cart has items', () => {
    setMockCartState({ cartCount: 3 })
    
    render(<CartIcon />)
    
    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('absolute', '-right-2', '-top-2')
    
    const cartIcon = screen.getByText('Open cart (3 items)')
    expect(cartIcon).toBeInTheDocument()
  })

  it('renders "99+" badge when cart has more than 99 items', () => {
    setMockCartState({ cartCount: 150 })
    
    render(<CartIcon />)
    
    const badge = screen.getByText('99+')
    expect(badge).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<CartIcon className="custom-class" />)
    
    const cartButton = screen.getByRole('link')
    expect(cartButton).toHaveClass('custom-class')
  })

  it('applies custom variant and size props', () => {
    render(<CartIcon variant="ghost" size="lg" />)
    
    const cartButton = screen.getByRole('link')
    expect(cartButton).toBeInTheDocument()
    // Note: Testing specific button styles would require more complex setup
    // This test ensures the props are passed without errors
  })

  it('has proper accessibility attributes', () => {
    setMockCartState({ cartCount: 5 })
    
    render(<CartIcon />)
    
    const cartButton = screen.getByRole('link')
    expect(cartButton).toHaveAttribute('href', '/cart')
    
    const screenReaderText = screen.getByText('Open cart (5 items)')
    expect(screenReaderText).toHaveClass('sr-only')
  })

  it('updates badge when cart count changes', () => {
    const { rerender } = render(<CartIcon />)
    
    // Initially empty
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    
    // Update cart count
    setMockCartState({ cartCount: 1 })
    rerender(<CartIcon />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})