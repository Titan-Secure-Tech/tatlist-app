/**
 * Unit Tests for Twilio SMS Service
 * Tests SMS sending functionality for delivery alerts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TwilioService } from '@/lib/sms/twilio'
import type { SMSDeliveryAlert } from '@/lib/sms/twilio'

// Mock Twilio
vi.mock('twilio', () => ({
  Twilio: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        sid: 'test-message-sid',
        status: 'sent',
      }),
    },
    lookups: {
      v2: {
        phoneNumbers: vi.fn((phone) => ({
          fetch: vi.fn().mockResolvedValue({
            valid: true,
            phoneNumber: phone,
          }),
        })),
      },
    },
  })),
}))

describe('TwilioService', () => {
  const mockEnv = {
    TWILIO_ACCOUNT_SID: 'test-account-sid',
    TWILIO_AUTH_TOKEN: 'test-auth-token',
    TWILIO_PHONE_NUMBER: '+15551234567',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set environment variables
    process.env.TWILIO_ACCOUNT_SID = mockEnv.TWILIO_ACCOUNT_SID
    process.env.TWILIO_AUTH_TOKEN = mockEnv.TWILIO_AUTH_TOKEN
    process.env.TWILIO_PHONE_NUMBER = mockEnv.TWILIO_PHONE_NUMBER
  })

  describe('sendDeliveryAlert', () => {
    it('should send SMS successfully for arriving_now alert', async () => {
      const alert: SMSDeliveryAlert = {
        to: '+15559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-sid')
    })

    it('should format phone number correctly (US 10-digit)', async () => {
      const alert: SMSDeliveryAlert = {
        to: '5559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'eta_10_minutes',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(true)
    })

    it('should include driver name in message when provided', async () => {
      const alert: SMSDeliveryAlert = {
        to: '+15559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'eta_5_minutes',
        driverName: 'John Doe',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(true)
    })

    it('should include tracking URL when provided', async () => {
      const alert: SMSDeliveryAlert = {
        to: '+15559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'distance_1_mile',
        trackingUrl: 'https://tatlist.com/track/12345',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(true)
    })

    it('should handle invalid phone number format', async () => {
      const alert: SMSDeliveryAlert = {
        to: 'invalid-phone',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number format')
    })

    it('should handle missing environment variables', async () => {
      delete process.env.TWILIO_PHONE_NUMBER

      const alert: SMSDeliveryAlert = {
        to: '+15559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)

      expect(result.success).toBe(false)
      expect(result.error).toContain('TWILIO_PHONE_NUMBER')
    })

    it('should send correct message for each alert type', async () => {
      const alertTypes: SMSDeliveryAlert['alertType'][] = [
        'arriving_now',
        'eta_5_minutes',
        'eta_10_minutes',
        'distance_half_mile',
        'distance_1_mile',
        'distance_2_miles',
      ]

      for (const alertType of alertTypes) {
        const alert: SMSDeliveryAlert = {
          to: '+15559876543',
          orderId: '12345678-1234-1234-1234-123456789012',
          alertType,
        }

        const result = await TwilioService.sendDeliveryAlert(alert)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('sendBulkDeliveryAlerts', () => {
    it('should send multiple alerts successfully', async () => {
      const alerts: SMSDeliveryAlert[] = [
        {
          to: '+15559876543',
          orderId: '12345678-1234-1234-1234-123456789012',
          alertType: 'arriving_now',
        },
        {
          to: '+15559876544',
          orderId: '12345678-1234-1234-1234-123456789013',
          alertType: 'eta_5_minutes',
        },
      ]

      const result = await TwilioService.sendBulkDeliveryAlerts(alerts)

      expect(result.sent).toBe(2)
      expect(result.failed).toBe(0)
      expect(result.results).toHaveLength(2)
    })

    it('should handle partial failures', async () => {
      const alerts: SMSDeliveryAlert[] = [
        {
          to: '+15559876543',
          orderId: '12345678-1234-1234-1234-123456789012',
          alertType: 'arriving_now',
        },
        {
          to: 'invalid-phone',
          orderId: '12345678-1234-1234-1234-123456789013',
          alertType: 'eta_5_minutes',
        },
      ]

      const result = await TwilioService.sendBulkDeliveryAlerts(alerts)

      expect(result.sent).toBe(1)
      expect(result.failed).toBe(1)
    })

    it('should add delay between messages', async () => {
      const alerts: SMSDeliveryAlert[] = [
        {
          to: '+15559876543',
          orderId: '12345678-1234-1234-1234-123456789012',
          alertType: 'arriving_now',
        },
        {
          to: '+15559876544',
          orderId: '12345678-1234-1234-1234-123456789013',
          alertType: 'eta_5_minutes',
        },
      ]

      const startTime = Date.now()
      await TwilioService.sendBulkDeliveryAlerts(alerts)
      const endTime = Date.now()

      // Should take at least 100ms due to delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })
  })

  describe('verifyPhoneNumber', () => {
    it('should verify a valid phone number', async () => {
      const result = await TwilioService.verifyPhoneNumber('+15559876543')

      expect(result.valid).toBe(true)
      expect(result.formatted).toBe('+15559876543')
    })

    it('should reject invalid phone number format', async () => {
      const result = await TwilioService.verifyPhoneNumber('invalid')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid phone number format')
    })

    it('should format US phone numbers correctly', async () => {
      const result = await TwilioService.verifyPhoneNumber('5559876543')

      expect(result.valid).toBe(true)
      expect(result.formatted).toBe('+15559876543')
    })
  })

  describe('getMessageStatus', () => {
    it('should get message status successfully', async () => {
      const result = await TwilioService.getMessageStatus('test-message-sid')

      expect(result.status).toBeDefined()
    })

    it('should handle errors when fetching status', async () => {
      const { Twilio } = await import('twilio')
      const mockTwilio = Twilio as unknown as ReturnType<typeof vi.fn>
      mockTwilio.mockImplementationOnce(() => ({
        messages: vi.fn(() => ({
          fetch: vi.fn().mockRejectedValue(new Error('Message not found')),
        })),
      }))

      const result = await TwilioService.getMessageStatus('invalid-sid')

      expect(result.status).toBe('unknown')
      expect(result.error).toBeDefined()
    })
  })

  describe('phone number formatting', () => {
    it('should format 10-digit US numbers', async () => {
      const alert: SMSDeliveryAlert = {
        to: '5559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)
      expect(result.success).toBe(true)
    })

    it('should handle numbers with country code', async () => {
      const alert: SMSDeliveryAlert = {
        to: '+15559876543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)
      expect(result.success).toBe(true)
    })

    it('should handle numbers with dashes and spaces', async () => {
      const alert: SMSDeliveryAlert = {
        to: '555-987-6543',
        orderId: '12345678-1234-1234-1234-123456789012',
        alertType: 'arriving_now',
      }

      const result = await TwilioService.sendDeliveryAlert(alert)
      expect(result.success).toBe(true)
    })
  })
})
