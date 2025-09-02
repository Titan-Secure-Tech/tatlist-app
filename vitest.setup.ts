import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
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
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
     
    return React.createElement('img', props)
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    return React.createElement('a', props, children)
  },
}))

// Mock use-shopping-cart
const mockCartContext = {
  cartCount: 0,
  cartDetails: {},
  addItem: vi.fn(),
  removeItem: vi.fn(),
  incrementItem: vi.fn(),
  decrementItem: vi.fn(),
  clearCart: vi.fn(),
  formattedTotalPrice: '$0.00',
  totalPrice: 0,
}

vi.mock('use-shopping-cart', () => ({
  useShoppingCart: () => mockCartContext,
  CartProvider: ({ children }: React.PropsWithChildren) => children,
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    })),
  })),
}))

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()

  // Reset cart context to default values
  mockCartContext.cartCount = 0
  mockCartContext.cartDetails = {}
  mockCartContext.formattedTotalPrice = '$0.00'
  mockCartContext.totalPrice = 0
})

// Make mock available globally for tests
;(globalThis as Record<string, unknown>).mockCartContext = mockCartContext
