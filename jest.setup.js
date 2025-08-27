import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock use-shopping-cart
const mockCartContext = {
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

jest.mock('use-shopping-cart', () => ({
  useShoppingCart: () => mockCartContext,
  CartProvider: ({ children }) => children,
}))

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  
  // Reset cart context to default values
  mockCartContext.cartCount = 0
  mockCartContext.cartDetails = {}
  mockCartContext.formattedTotalPrice = '$0.00'
  mockCartContext.totalPrice = 0
})

// Make mock available globally for tests
global.mockCartContext = mockCartContext

// Mock Supabase client
jest.mock('./lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  })),
}))