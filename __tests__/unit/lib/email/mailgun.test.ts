/**
 * Unit Tests for Mailgun Email Service
 * Tests email sending functionality with mocked Mailgun API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MailgunService } from '@/lib/email/mailgun'

// Mock fetch globally
global.fetch = vi.fn()

describe('MailgunService', () => {
  let mailgunService: MailgunService
  const mockEnv = {
    MAILGUN_BASE_URL: 'https://api.mailgun.net',
    MAILGUN_DOMAIN: 'test.com',
    MAILGUN_SENDING_KEY: 'test-api-key',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set environment variables
    process.env.MAILGUN_BASE_URL = mockEnv.MAILGUN_BASE_URL
    process.env.MAILGUN_DOMAIN = mockEnv.MAILGUN_DOMAIN
    process.env.MAILGUN_SENDING_KEY = mockEnv.MAILGUN_SENDING_KEY
    
    mailgunService = new MailgunService()
  })

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(mailgunService).toBeDefined()
    })

    it('should warn when credentials are missing', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      delete process.env.MAILGUN_DOMAIN
      delete process.env.MAILGUN_SENDING_KEY
      
      new MailgunService()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Mailgun credentials not configured. Emails will not be sent.'
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const result = await mailgunService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
        html: '<p>Test content</p>',
      })

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle email sending failure', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Error message'),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const result = await mailgunService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      })

      expect(result).toBe(false)
    })

    it('should skip sending when not configured', async () => {
      delete process.env.MAILGUN_DOMAIN
      const unconfiguredService = new MailgunService()

      const result = await unconfiguredService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      })

      expect(result).toBe(false)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle multiple recipients', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      await mailgunService.sendEmail({
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Email',
        text: 'Test content',
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const formData = fetchCall[1].body as FormData
      expect(formData.get('to')).toBe('test1@example.com,test2@example.com')
    })

    it('should include reply-to header when provided', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      await mailgunService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
        replyTo: 'reply@example.com',
      })

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const formData = fetchCall[1].body as FormData
      expect(formData.get('h:Reply-To')).toBe('reply@example.com')
    })
  })

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const orderData = {
        orderId: '12345678-1234-1234-1234-123456789012',
        customerName: 'John Doe',
        items: [
          { name: 'Product 1', quantity: 2, price: 1999 },
          { name: 'Product 2', quantity: 1, price: 2999 },
        ],
        subtotal: 6997,
        deliveryFee: 500,
        tax: 524,
        total: 8021,
        deliveryAddress: {
          line1: '123 Main St',
          city: 'Tampa',
          state: 'FL',
          postalCode: '33601',
        },
      }

      const result = await mailgunService.sendOrderConfirmation('test@example.com', orderData)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendOrderStatusUpdate', () => {
    it('should send status update email', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const orderData = {
        orderId: '12345678-1234-1234-1234-123456789012',
        customerName: 'John Doe',
        status: 'out_for_delivery' as const,
        message: 'Your order is on the way!',
        estimatedTime: '30 minutes',
      }

      const result = await mailgunService.sendOrderStatusUpdate('test@example.com', orderData)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should use correct from address for delivery status', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const orderData = {
        orderId: '12345678-1234-1234-1234-123456789012',
        customerName: 'John Doe',
        status: 'out_for_delivery' as const,
      }

      await mailgunService.sendOrderStatusUpdate('test@example.com', orderData)

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const formData = fetchCall[1].body as FormData
      expect(formData.get('from')).toContain('delivery@')
    })
  })

  describe('sendContactFormEmail', () => {
    it('should send contact form email', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'test-message-id' }),
      }
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        subject: 'Product Inquiry',
        message: 'I have a question about your products.',
      }

      const result = await mailgunService.sendContactFormEmail(contactData)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      )

      const result = await mailgunService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      })

      expect(result).toBe(false)
    })

    it('should log errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      )

      await mailgunService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'Test content',
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})
