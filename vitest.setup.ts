import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver

// Create mock router functions that can be accessed in tests
const mockRouterPush = vi.fn()
const mockRouterReplace = vi.fn()
const mockRouterBack = vi.fn()
const mockRouterRefresh = vi.fn()

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockRouterPush,
      replace: mockRouterReplace,
      prefetch: vi.fn(),
      back: mockRouterBack,
      forward: vi.fn(),
      refresh: mockRouterRefresh,
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Export for tests to use
;(
  globalThis as typeof globalThis & {
    mockRouter: {
      push: typeof mockRouterPush
      replace: typeof mockRouterReplace
      back: typeof mockRouterBack
      refresh: typeof mockRouterRefresh
    }
  }
).mockRouter = {
  push: mockRouterPush,
  replace: mockRouterReplace,
  back: mockRouterBack,
  refresh: mockRouterRefresh,
}

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

// Mock cart store
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

vi.mock('@/lib/store/cart-store', () => ({
  useShoppingCart: () => mockCartContext,
  useCartStore: () => mockCartContext,
}))

// Mock CartProvider component
vi.mock('@/components/providers/CartProvider', () => ({
  CartProvider: ({ children }: React.PropsWithChildren) => React.createElement('div', {}, children),
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
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
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

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        eq: vi.fn(() => ({
          data: null,
          error: null,
          maybeSingle: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  })),
}))

// Suppress console errors and warnings for specific known issues
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React warnings about non-boolean attributes on SVG elements (from Lucide icons)
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Received `true` for a non-boolean attribute') ||
        args[0].includes('for a non-boolean attribute'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: unknown[]) => {
    // Suppress any warnings we want to ignore
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

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
