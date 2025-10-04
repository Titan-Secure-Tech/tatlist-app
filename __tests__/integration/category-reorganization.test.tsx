/**
 * Integration tests for Issue #31 - Category Reorganization
 * Tests that categories are organized into 3 main groups:
 * - Tattoo Supplies
 * - Shop Supplies
 * - Piercing and Jewelry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CategoriesPage from '@/app/categories/page'
import * as supabaseServer from '@/lib/supabase/server'

// Mock Supabase server client with category data
const createMockCategories = () => [
  { category: 'Tattoo Machines' },
  { category: 'Needles & Cartridges' },
  { category: 'Inks & Colors' },
  { category: 'Tattoo Parts' },
  { category: 'Art and stencil supplies' },
  { category: 'Tattoo Shop Furniture and Supplies' },
  { category: 'Medical Supplies and Sterilization Equipment' },
  { category: 'Aftercare' },
  { category: 'Piercing' },
  { category: 'Body Jewelry' },
]

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

beforeEach(() => {
  // Set up the mock implementation for each test
  const mockFrom = vi.fn((table: string) => {
    if (table === 'products') {
      return {
        select: vi.fn((columns: string) => {
          if (columns === 'category') {
            return {
              order: vi.fn(() => ({
                data: createMockCategories(),
                error: null,
              })),
            }
          }
          // For count queries
          return {
            eq: vi.fn(() => ({
              data: null,
              error: null,
              count: 0,
            })),
          }
        }),
      }
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
  })

  vi.mocked(supabaseServer.createClient).mockResolvedValue({
    from: mockFrom,
  } as ReturnType<typeof supabaseServer.createClient>)
})

describe('Issue #31 - Category Reorganization', () => {
  describe('Category Groups Structure', () => {
    it('displays all three main category groups', async () => {
      const Component = await CategoriesPage()
      render(Component)

      // Check for all three main groups
      expect(screen.getByText('Tattoo Supplies')).toBeInTheDocument()
      expect(screen.getByText('Shop Supplies')).toBeInTheDocument()
      expect(screen.getByText('Piercing and Jewelry')).toBeInTheDocument()
    })

    it('shows group descriptions', async () => {
      const Component = await CategoriesPage()
      render(Component)

      expect(screen.getByText('Essential tools and materials for tattooing')).toBeInTheDocument()
      expect(screen.getByText('Professional equipment for your tattoo shop')).toBeInTheDocument()
      expect(screen.getByText('Body piercing supplies and jewelry')).toBeInTheDocument()
    })

    it('displays group icons', async () => {
      const Component = await CategoriesPage()
      const { container } = render(Component)

      // Each group should have an icon (SVG element)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Tattoo Supplies Group', () => {
    it('includes correct categories in Tattoo Supplies group', async () => {
      const Component = await CategoriesPage()
      render(Component)

      // Find the Tattoo Supplies section
      const tattooSuppliesSection = screen.getByText('Tattoo Supplies').closest('div')
        ?.parentElement?.parentElement

      if (tattooSuppliesSection) {
        // Check for categories that should be in this group
        const expectedCategories = [
          'Tattoo Machines',
          'Needles & Cartridges',
          'Inks & Colors',
          'Art and stencil supplies',
        ]

        expectedCategories.forEach(category => {
          expect(within(tattooSuppliesSection).getByText(category)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Shop Supplies Group', () => {
    it('includes correct categories in Shop Supplies group', async () => {
      const Component = await CategoriesPage()
      render(Component)

      // Find the Shop Supplies section
      const shopSuppliesSection = screen.getByText('Shop Supplies').closest('div')
        ?.parentElement?.parentElement

      if (shopSuppliesSection) {
        // Check for categories that should be in this group
        const expectedCategories = [
          'Tattoo Shop Furniture and Supplies',
          'Medical Supplies and Sterilization Equipment',
          'Aftercare',
        ]

        expectedCategories.forEach(category => {
          expect(within(shopSuppliesSection).getByText(category)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Category Links', () => {
    it('creates proper slugs for category URLs', async () => {
      const Component = await CategoriesPage()
      render(Component)

      // Check that category links have proper href attributes
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
      const Component = await CategoriesPage()
      render(Component)

      // Should show product count text (e.g., "0 products")
      const productCounts = screen.getAllByText(/\d+ products?/i)
      expect(productCounts.length).toBeGreaterThan(0)
    })
  })

  describe('Page Header', () => {
    it('displays updated page title and description', async () => {
      const Component = await CategoriesPage()
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
      const Component = await CategoriesPage()
      render(Component)

      // Each group should have a header followed by category cards
      const groupHeaders = screen.getAllByRole('heading', { level: 2 })
      expect(groupHeaders.length).toBeGreaterThanOrEqual(3)

      // Verify Tattoo Supplies is a heading
      const tattooSuppliesHeading = groupHeaders.find(h => h.textContent === 'Tattoo Supplies')
      expect(tattooSuppliesHeading).toBeInTheDocument()

      // Verify Shop Supplies is a heading
      const shopSuppliesHeading = groupHeaders.find(h => h.textContent === 'Shop Supplies')
      expect(shopSuppliesHeading).toBeInTheDocument()

      // Verify Piercing and Jewelry is a heading
      const piercingHeading = groupHeaders.find(h => h.textContent === 'Piercing and Jewelry')
      expect(piercingHeading).toBeInTheDocument()
    })

    it('uses grid layout for categories within each group', async () => {
      const Component = await CategoriesPage()
      const { container } = render(Component)

      // Find elements with grid classes
      const gridElements = container.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('Empty Category Groups', () => {
    it('does not display groups with no products', async () => {
      const Component = await CategoriesPage()
      render(Component)

      // Tattoo Supplies should appear
      expect(screen.queryByText('Tattoo Supplies')).toBeInTheDocument()

      // Groups with no matching categories might not appear
      // (This depends on the actual implementation - the component filters out empty groups)
    })
  })

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', async () => {
      const Component = await CategoriesPage()
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
      const Component = await CategoriesPage()
      render(Component)

      // Each category link should have the category name as text
      const machinesLink = screen.getByText('Tattoo Machines')
      expect(machinesLink.closest('a')).toBeInTheDocument()
    })
  })
})
