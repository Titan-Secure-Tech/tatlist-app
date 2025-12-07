/**
 * Integration tests for Issue #31 - Category Reorganization
 * Tests that categories are organized into 3 main groups:
 * - Tattoo Supplies
 * - Shop Supplies
 * - Piercing and Jewelry
 *
 * Updated to match new database structure using collections and categories tables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { CategoriesContent } from '@/app/categories/page'
import * as supabaseServer from '@/lib/supabase/server'

// Mock data matching the new database structure
const mockCollections = [
  {
    id: 'col-1',
    slug: 'tattoo-supplies',
    name: 'Tattoo Supplies',
    description: 'Essential tools and materials for tattooing',
    sort_order: 1,
  },
  {
    id: 'col-2',
    slug: 'shop-supplies',
    name: 'Shop Supplies',
    description: 'Professional equipment for your tattoo shop',
    sort_order: 2,
  },
  {
    id: 'col-3',
    slug: 'piercing-jewelry',
    name: 'Piercing and Jewelry',
    description: 'Body piercing supplies and jewelry',
    sort_order: 3,
  },
]

const mockCategories: Record<
  string,
  Array<{ id: string; slug: string; name: string; description: string; sort_order: number }>
> = {
  'col-1': [
    {
      id: 'cat-1',
      slug: 'machines',
      name: 'Tattoo Machines',
      description: 'Professional tattoo machines',
      sort_order: 1,
    },
    {
      id: 'cat-2',
      slug: 'needles',
      name: 'Needles & Cartridges',
      description: 'Tattoo needles and cartridges',
      sort_order: 2,
    },
    {
      id: 'cat-3',
      slug: 'inks',
      name: 'Inks & Colors',
      description: 'Professional tattoo inks',
      sort_order: 3,
    },
    {
      id: 'cat-4',
      slug: 'art-stencil',
      name: 'Art and stencil supplies',
      description: 'Stencil and art supplies',
      sort_order: 4,
    },
  ],
  'col-2': [
    {
      id: 'cat-5',
      slug: 'furniture',
      name: 'Tattoo Shop Furniture and Supplies',
      description: 'Shop furniture',
      sort_order: 1,
    },
    {
      id: 'cat-6',
      slug: 'medical-supplies',
      name: 'Medical Supplies and Sterilization Equipment',
      description: 'Medical supplies',
      sort_order: 2,
    },
    {
      id: 'cat-7',
      slug: 'aftercare',
      name: 'Aftercare',
      description: 'Aftercare products',
      sort_order: 3,
    },
  ],
  'col-3': [
    {
      id: 'cat-8',
      slug: 'piercing',
      name: 'Piercing',
      description: 'Piercing supplies',
      sort_order: 1,
    },
    {
      id: 'cat-9',
      slug: 'body-jewelry',
      name: 'Body Jewelry',
      description: 'Body jewelry',
      sort_order: 2,
    },
  ],
}

// Product counts per category
const mockProductCounts: Record<string, number> = {
  'cat-1': 15,
  'cat-2': 25,
  'cat-3': 30,
  'cat-4': 10,
  'cat-5': 8,
  'cat-6': 12,
  'cat-7': 20,
  'cat-8': 18,
  'cat-9': 22,
}

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Helper to create a chainable mock
function createChainableMock(result: { data?: unknown; error?: unknown; count?: number }) {
  const chainable: Record<string, unknown> = {}
  const methods = ['select', 'order', 'eq', 'not', 'limit', 'single', 'head']

  methods.forEach(method => {
    chainable[method] = vi.fn(() => chainable)
  })

  // Terminal methods return the result
  chainable.order = vi.fn(() => result)
  chainable.single = vi.fn(() => result)

  return chainable
}

// Helper function to set up the standard mock
function setupStandardMock() {
  // Track which collection we're querying categories for
  let currentCollectionId: string | null = null
  let currentCategoryId: string | null = null

  const mockFrom = vi.fn((table: string) => {
    if (table === 'collections') {
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockCollections,
            error: null,
          })),
        })),
      }
    }

    if (table === 'categories') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn((field: string, value: string) => {
            if (field === 'collection_id') {
              currentCollectionId = value
            }
            return {
              order: vi.fn(() => ({
                data: mockCategories[currentCollectionId || ''] || [],
                error: null,
              })),
            }
          }),
        })),
      }
    }

    if (table === 'products') {
      return {
        select: vi.fn((columns: string, options?: { count?: string; head?: boolean }) => {
          // Count query: select('*', { count: 'exact', head: true })
          if (options?.count === 'exact' && options?.head === true) {
            return {
              eq: vi.fn((field: string, value: string) => {
                if (field === 'category_id') {
                  currentCategoryId = value
                }
                return {
                  not: vi.fn(() => ({
                    data: null,
                    error: null,
                    count: mockProductCounts[currentCategoryId || ''] || 0,
                  })),
                }
              }),
            }
          }

          // Image query: select('image_url')
          if (columns === 'image_url') {
            return {
              eq: vi.fn((field: string, value: string) => {
                if (field === 'category_id') {
                  currentCategoryId = value
                }
                return {
                  not: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      single: vi.fn(() => ({
                        data: { image_url: '/test-image.jpg' },
                        error: null,
                      })),
                    })),
                  })),
                }
              }),
            }
          }

          // Default
          return createChainableMock({ data: [], error: null })
        }),
      }
    }

    // Default fallback for other tables
    return createChainableMock({ data: [], error: null })
  })

  vi.mocked(supabaseServer.createClient).mockResolvedValue({
    from: mockFrom,
  } as unknown as ReturnType<typeof supabaseServer.createClient>)
}

beforeEach(() => {
  vi.clearAllMocks()
  setupStandardMock()
})

describe('Issue #31 - Category Reorganization', () => {
  describe('Category Groups Structure', () => {
    it('displays all three main category groups', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Check for all three main groups
      expect(screen.getByText('Tattoo Supplies')).toBeInTheDocument()
      expect(screen.getByText('Shop Supplies')).toBeInTheDocument()
      expect(screen.getByText('Piercing and Jewelry')).toBeInTheDocument()
    })

    it('shows group descriptions', async () => {
      const Component = await CategoriesContent()
      render(Component)

      expect(screen.getByText('Essential tools and materials for tattooing')).toBeInTheDocument()
      expect(screen.getByText('Professional equipment for your tattoo shop')).toBeInTheDocument()
      expect(screen.getByText('Body piercing supplies and jewelry')).toBeInTheDocument()
    })

    it('displays group icons', async () => {
      const Component = await CategoriesContent()
      const { container } = render(Component)

      // Each group should have an icon (SVG element)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Tattoo Supplies Group', () => {
    it('includes correct categories in Tattoo Supplies group', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Check for categories that should be in this group
      const expectedCategories = [
        'Tattoo Machines',
        'Needles & Cartridges',
        'Inks & Colors',
        'Art and stencil supplies',
      ]

      for (const category of expectedCategories) {
        expect(screen.getByText(category)).toBeInTheDocument()
      }
    })
  })

  describe('Shop Supplies Group', () => {
    it('includes correct categories in Shop Supplies group', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Check for categories that should be in this group
      const expectedCategories = [
        'Tattoo Shop Furniture and Supplies',
        'Medical Supplies and Sterilization Equipment',
        'Aftercare',
      ]

      for (const category of expectedCategories) {
        expect(screen.getByText(category)).toBeInTheDocument()
      }
    })
  })

  describe('Category Links', () => {
    it('creates proper slugs for category URLs', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Check that category links have proper href attributes based on slug
      const machinesLink = screen.getByText('Tattoo Machines').closest('a')
      expect(machinesLink).toHaveAttribute('href', '/categories/machines')

      const needlesLink = screen.getByText('Needles & Cartridges').closest('a')
      expect(needlesLink).toHaveAttribute('href', '/categories/needles')

      const medicalLink = screen
        .getByText('Medical Supplies and Sterilization Equipment')
        .closest('a')
      expect(medicalLink).toHaveAttribute('href', '/categories/medical-supplies')
    })
  })

  describe('Product Counts', () => {
    it('displays product count for each category', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Should show product count text (e.g., "15 products")
      const productCounts = screen.getAllByText(/\d+ products?/i)
      expect(productCounts.length).toBeGreaterThan(0)
    })
  })

  describe('Page Header', () => {
    it('displays updated page title and description', async () => {
      const Component = await CategoriesContent()
      render(Component)

      expect(screen.getByText('Product Categories')).toBeInTheDocument()
      expect(
        screen.getByText(
          /browse our comprehensive selection of professional tattoo and piercing supplies/i
        )
      ).toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('groups categories under their respective headers', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Each group should have a header followed by category cards
      const groupHeaders = screen.getAllByRole('heading', { level: 2 })
      expect(groupHeaders.length).toBeGreaterThanOrEqual(3)

      // Verify collection names are headings
      const headingTexts = groupHeaders.map(h => h.textContent)
      expect(headingTexts).toContain('Tattoo Supplies')
      expect(headingTexts).toContain('Shop Supplies')
      expect(headingTexts).toContain('Piercing and Jewelry')
    })

    it('uses grid layout for categories within each group', async () => {
      const Component = await CategoriesContent()
      const { container } = render(Component)

      // Find elements with grid classes
      const gridElements = container.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('Empty Category Groups', () => {
    it('does not display groups with no products', async () => {
      // Override mock to return empty categories for piercing collection
      const emptyCollectionMock = vi.fn((table: string) => {
        if (table === 'collections') {
          return {
            select: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockCollections,
                error: null,
              })),
            })),
          }
        }

        if (table === 'categories') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((field: string, value: string) => ({
                order: vi.fn(() => ({
                  // Return empty array for piercing-jewelry collection
                  data: value === 'col-3' ? [] : mockCategories[value] || [],
                  error: null,
                })),
              })),
            })),
          }
        }

        if (table === 'products') {
          return {
            select: vi.fn((columns: string, options?: { count?: string; head?: boolean }) => {
              if (options?.count === 'exact') {
                return {
                  eq: vi.fn(() => ({
                    not: vi.fn(() => ({ data: null, error: null, count: 5 })),
                  })),
                }
              }
              if (columns === 'image_url') {
                return {
                  eq: vi.fn(() => ({
                    not: vi.fn(() => ({
                      limit: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { image_url: '/test.jpg' }, error: null })),
                      })),
                    })),
                  })),
                }
              }
              return { eq: vi.fn().mockReturnThis(), not: vi.fn().mockReturnThis() }
            }),
          }
        }

        return { select: vi.fn().mockReturnThis() }
      })

      vi.mocked(supabaseServer.createClient).mockResolvedValue({
        from: emptyCollectionMock,
      } as unknown as ReturnType<typeof supabaseServer.createClient>)

      const Component = await CategoriesContent()
      render(Component)

      // Tattoo Supplies and Shop Supplies should appear
      expect(screen.getByText('Tattoo Supplies')).toBeInTheDocument()
      expect(screen.getByText('Shop Supplies')).toBeInTheDocument()

      // Piercing and Jewelry should not appear (empty categories)
      expect(screen.queryByText('Piercing and Jewelry')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Main heading (h1)
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Product Categories')

      // Group headings (h2)
      const groupHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(groupHeadings.length).toBeGreaterThanOrEqual(3)

      // Category headings (h3)
      const categoryHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(categoryHeadings.length).toBeGreaterThan(0)
    })

    it('provides descriptive link text for categories', async () => {
      const Component = await CategoriesContent()
      render(Component)

      // Each category link should have the category name as text
      const machinesText = screen.getByText('Tattoo Machines')
      expect(machinesText.closest('a')).toBeInTheDocument()
    })
  })
})
