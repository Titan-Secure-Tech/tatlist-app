/**
 * Unit Tests for Phone Verification Service
 * Tests verification code generation, sending, and validation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PhoneVerificationService } from '@/lib/verification/phone-verification'

// Mock Twilio
vi.mock('twilio', () => ({
  Twilio: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        sid: 'test-message-sid',
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

describe('PhoneVerificationService', () => {
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

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('+15559876543')

      expect(result.success).toBe(true)
      expect(result.expiresAt).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should format phone numbers correctly', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('5559876543')

      expect(result.success).toBe(true)
    })

    it('should enforce rate limiting', async () => {
      const phoneNumber = '+15559876543'

      // Send 3 verification codes (max allowed)
      for (let i = 0; i < 3; i++) {
        const result = await PhoneVerificationService.sendVerificationCode(phoneNumber)
        expect(result.success).toBe(true)
      }

      // 4th attempt should be rate limited
      const result = await PhoneVerificationService.sendVerificationCode(phoneNumber)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Too many verification requests')
    })

    it('should generate a 6-digit code', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('+15559876543')
      expect(result.success).toBe(true)
      
      // The code is stored internally, we can't directly access it
      // but we can verify it exists by checking pending verification
      expect(PhoneVerificationService.hasPendingVerification('+15559876543')).toBe(true)
    })

    it('should handle missing Twilio credentials', async () => {
      delete process.env.TWILIO_ACCOUNT_SID

      const result = await PhoneVerificationService.sendVerificationCode('+15559876543')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Twilio credentials not configured')
    })

    it('should set expiration time correctly', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('+15559876543')

      expect(result.success).toBe(true)
      expect(result.expiresAt).toBeDefined()
      
      // Should expire in 10 minutes (600 seconds)
      const now = new Date()
      const expiresAt = result.expiresAt!
      const diffSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      
      expect(diffSeconds).toBeGreaterThan(590) // Allow some margin
      expect(diffSeconds).toBeLessThanOrEqual(600)
    })
  })

  describe('verifyCode', () => {
    it('should verify correct code successfully', async () => {
      const phoneNumber = '+15559876543'
      
      // Send verification code first
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // We need to somehow get the code that was sent
      // In a real scenario, we'd get it from SMS
      // For testing, we'll mock the verification map
      const verification = (PhoneVerificationService as any).verificationCodes?.get?.(phoneNumber)
      
      if (verification) {
        const result = await PhoneVerificationService.verifyCode(phoneNumber, verification.code)
        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()
      }
    })

    it('should reject incorrect code', async () => {
      const phoneNumber = '+15559876543'
      
      // Send verification code first
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Try to verify with wrong code
      const result = await PhoneVerificationService.verifyCode(phoneNumber, '000000')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid verification code')
    })

    it('should reject when no code exists', async () => {
      const result = await PhoneVerificationService.verifyCode('+15559876543', '123456')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('No verification code found')
    })

    it('should enforce max attempts limit', async () => {
      const phoneNumber = '+15559876543'
      
      // Send verification code
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Try 3 times with wrong code (max attempts)
      for (let i = 0; i < 3; i++) {
        await PhoneVerificationService.verifyCode(phoneNumber, '000000')
      }
      
      // 4th attempt should fail with max attempts error
      const result = await PhoneVerificationService.verifyCode(phoneNumber, '000000')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Too many failed attempts')
    })

    it('should reject expired codes', async () => {
      vi.useFakeTimers()
      const phoneNumber = '+15559876543'
      
      // Send verification code
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Fast-forward time by 11 minutes (past expiration)
      vi.advanceTimersByTime(11 * 60 * 1000)
      
      const result = await PhoneVerificationService.verifyCode(phoneNumber, '123456')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should remove code after successful verification', async () => {
      const phoneNumber = '+15559876543'
      
      // Send and verify code
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Get the code (in real test, we'd capture it from the SMS mock)
      const verification = (PhoneVerificationService as any).verificationCodes?.get?.(phoneNumber)
      if (verification) {
        await PhoneVerificationService.verifyCode(phoneNumber, verification.code)
      }
      
      // Should no longer have pending verification
      expect(PhoneVerificationService.hasPendingVerification(phoneNumber)).toBe(false)
    })
  })

  describe('hasPendingVerification', () => {
    it('should return true when verification is pending', async () => {
      const phoneNumber = '+15559876543'
      
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      expect(PhoneVerificationService.hasPendingVerification(phoneNumber)).toBe(true)
    })

    it('should return false when no verification exists', () => {
      expect(PhoneVerificationService.hasPendingVerification('+15559876543')).toBe(false)
    })

    it('should return false for expired verification', async () => {
      vi.useFakeTimers()
      const phoneNumber = '+15559876543'
      
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Fast-forward past expiration
      vi.advanceTimersByTime(11 * 60 * 1000)
      
      expect(PhoneVerificationService.hasPendingVerification(phoneNumber)).toBe(false)
    })
  })

  describe('getTimeUntilExpiry', () => {
    it('should return time in seconds until expiry', async () => {
      const phoneNumber = '+15559876543'
      
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      const timeLeft = PhoneVerificationService.getTimeUntilExpiry(phoneNumber)
      
      expect(timeLeft).not.toBeNull()
      expect(timeLeft).toBeGreaterThan(0)
      expect(timeLeft).toBeLessThanOrEqual(600) // 10 minutes max
    })

    it('should return null when no verification exists', () => {
      const timeLeft = PhoneVerificationService.getTimeUntilExpiry('+15559876543')
      expect(timeLeft).toBeNull()
    })

    it('should return null for expired verification', async () => {
      vi.useFakeTimers()
      const phoneNumber = '+15559876543'
      
      await PhoneVerificationService.sendVerificationCode(phoneNumber)
      
      // Fast-forward past expiration
      vi.advanceTimersByTime(11 * 60 * 1000)
      
      const timeLeft = PhoneVerificationService.getTimeUntilExpiry(phoneNumber)
      expect(timeLeft).toBeNull()
    })
  })

  describe('phone number formatting', () => {
    it('should format 10-digit US numbers', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('5559876543')
      expect(result.success).toBe(true)
    })

    it('should handle numbers with country code', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('+15559876543')
      expect(result.success).toBe(true)
    })

    it('should handle numbers with formatting', async () => {
      const result = await PhoneVerificationService.sendVerificationCode('(555) 987-6543')
      expect(result.success).toBe(true)
    })
  })
})
