/**
 * Simplified integration tests for GitHub issues fixes
 * These tests verify basic rendering and structure
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactPage from '@/app/contact/page'
import { ProductSearch } from '@/components/products/ProductSearch'

describe('GitHub Issues - Simple Integration Tests', () => {
  describe('Issue #33 - Contact Page Phone Number', () => {
    it('displays the correct phone number 813-310-3877', () => {
      render(<ContactPage />)
      expect(screen.getByText('813-310-3877')).toBeInTheDocument()
    })

    it('phone number is clickable with tel: link', () => {
      render(<ContactPage />)
      const phoneLink = screen.getByText('813-310-3877').closest('a')
      expect(phoneLink).toHaveAttribute('href', 'tel:813-310-3877')
    })

    it('does not show the old placeholder phone number', () => {
      render(<ContactPage />)
      expect(screen.queryByText(/\(813\) XXX-XXXX/i)).not.toBeInTheDocument()
    })
  })

  describe('Issue #23 - Products Page Search', () => {
    it('renders search input with placeholder text', () => {
      render(<ProductSearch />)
      const searchInput = screen.getByPlaceholderText(
        /search products by name, description, or category/i
      )
      expect(searchInput).toBeInTheDocument()
    })

    it('shows search button', () => {
      render(<ProductSearch />)
      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toBeInTheDocument()
    })

    it('displays search icon', () => {
      render(<ProductSearch />)
      const container = screen.getByPlaceholderText(
        /search products by name, description, or category/i
      ).parentElement
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Issue #20 - Contact Form Verification', () => {
    it('renders contact form with all required fields', () => {
      render(<ContactPage />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('shows phone field as optional', () => {
      render(<ContactPage />)

      const phoneLabel = screen.getByLabelText(/phone/i)
      expect(phoneLabel).toBeInTheDocument()
      expect(phoneLabel).not.toBeRequired()
    })

    it('has submit button', () => {
      render(<ContactPage />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('displays contact information including email', () => {
      render(<ContactPage />)

      expect(screen.getByText('info@tatlist.com')).toBeInTheDocument()
    })

    it('displays business hours', () => {
      render(<ContactPage />)

      expect(screen.getByText(/monday - saturday/i)).toBeInTheDocument()
      expect(screen.getByText(/9:00 am - 6:00 pm/i)).toBeInTheDocument()
    })
  })

  describe('Issue #21 - Features Page', () => {
    it('can import features page component', async () => {
      const FeaturesPage = (await import('@/app/features/page')).default
      expect(FeaturesPage).toBeDefined()
      expect(typeof FeaturesPage).toBe('function')
    })
  })
})
