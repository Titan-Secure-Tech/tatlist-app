/**
 * Phone Verification Service
 *
 * Handles sending and verifying SMS verification codes
 * Uses Twilio for SMS delivery and in-memory storage for codes
 */

interface VerificationCode {
  code: string
  phoneNumber: string
  expiresAt: Date
  attempts: number
}

// In-memory storage for verification codes
// In production, consider using Redis or database storage
const verificationCodes = new Map<string, VerificationCode>()

// Configuration
const CODE_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>()

/**
 * Phone Verification Service
 */
export class PhoneVerificationService {
  /**
   * Generate a random 6-digit verification code
   */
  private static generateCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    return code
  }

  /**
   * Get rate limit key for phone number
   */
  private static getRateLimitKey(phoneNumber: string): string {
    return `rate_limit:${phoneNumber}`
  }

  /**
   * Check if phone number is rate limited
   */
  private static isRateLimited(phoneNumber: string): boolean {
    const key = this.getRateLimitKey(phoneNumber)
    const rateLimit = rateLimitMap.get(key)

    if (!rateLimit) {
      return false
    }

    // Check if rate limit window has expired
    if (new Date() > rateLimit.resetAt) {
      rateLimitMap.delete(key)
      return false
    }

    // Check if max requests reached
    return rateLimit.count >= MAX_REQUESTS_PER_WINDOW
  }

  /**
   * Increment rate limit counter
   */
  private static incrementRateLimit(phoneNumber: string): void {
    const key = this.getRateLimitKey(phoneNumber)
    const rateLimit = rateLimitMap.get(key)

    if (!rateLimit) {
      rateLimitMap.set(key, {
        count: 1,
        resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
      })
    } else {
      rateLimit.count++
    }
  }

  /**
   * Clean up expired verification codes
   */
  private static cleanupExpiredCodes(): void {
    const now = new Date()
    for (const [key, verification] of verificationCodes.entries()) {
      if (now > verification.expiresAt) {
        verificationCodes.delete(key)
      }
    }
  }

  /**
   * Clean up expired rate limits
   */
  private static cleanupExpiredRateLimits(): void {
    const now = new Date()
    for (const [key, rateLimit] of rateLimitMap.entries()) {
      if (now > rateLimit.resetAt) {
        rateLimitMap.delete(key)
      }
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '')

    // If it's a US number without country code, add +1
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned
    }

    // Add + prefix
    return '+' + cleaned
  }

  /**
   * Send verification code to phone number
   */
  static async sendVerificationCode(phoneNumber: string): Promise<{
    success: boolean
    error?: string
    expiresAt?: Date
  }> {
    try {
      // Clean up expired codes and rate limits
      this.cleanupExpiredCodes()
      this.cleanupExpiredRateLimits()

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      // Check rate limiting
      if (this.isRateLimited(formattedPhone)) {
        return {
          success: false,
          error: 'Too many verification requests. Please wait a minute and try again.',
        }
      }

      // Generate verification code
      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

      // Store verification code
      verificationCodes.set(formattedPhone, {
        code,
        phoneNumber: formattedPhone,
        expiresAt,
        attempts: 0,
      })

      // Increment rate limit
      this.incrementRateLimit(formattedPhone)

      // Send SMS via Twilio
      const client = await import('twilio').then(mod => {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        if (!accountSid || !authToken) {
          throw new Error('Twilio credentials not configured')
        }
        return new mod.Twilio(accountSid, authToken)
      })

      const fromNumber = process.env.TWILIO_PHONE_NUMBER
      if (!fromNumber) {
        throw new Error('TWILIO_PHONE_NUMBER not configured')
      }

      await client.messages.create({
        body: `Your Tatlist verification code is: ${code}\n\nThis code will expire in ${CODE_EXPIRY_MINUTES} minutes.`,
        from: fromNumber,
        to: formattedPhone,
      })

      console.log(`Verification code sent to ${formattedPhone}`)

      return {
        success: true,
        expiresAt,
      }
    } catch (error) {
      console.error('Error sending verification code:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification code',
      }
    }
  }

  /**
   * Verify code for phone number
   */
  static async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Clean up expired codes
      this.cleanupExpiredCodes()

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      // Get stored verification code
      const verification = verificationCodes.get(formattedPhone)

      if (!verification) {
        return {
          success: false,
          error: 'No verification code found. Please request a new code.',
        }
      }

      // Check if code has expired
      if (new Date() > verification.expiresAt) {
        verificationCodes.delete(formattedPhone)
        return {
          success: false,
          error: 'Verification code has expired. Please request a new code.',
        }
      }

      // Check max attempts
      if (verification.attempts >= MAX_ATTEMPTS) {
        verificationCodes.delete(formattedPhone)
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new code.',
        }
      }

      // Verify code
      if (verification.code !== code) {
        verification.attempts++
        return {
          success: false,
          error: `Invalid verification code. ${MAX_ATTEMPTS - verification.attempts} attempts remaining.`,
        }
      }

      // Success! Remove verification code
      verificationCodes.delete(formattedPhone)

      console.log(`Phone number verified: ${formattedPhone}`)

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error verifying code:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify code',
      }
    }
  }

  /**
   * Check if phone number has a pending verification
   */
  static hasPendingVerification(phoneNumber: string): boolean {
    this.cleanupExpiredCodes()
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    return verificationCodes.has(formattedPhone)
  }

  /**
   * Get time until code expires
   */
  static getTimeUntilExpiry(phoneNumber: string): number | null {
    this.cleanupExpiredCodes()
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    const verification = verificationCodes.get(formattedPhone)

    if (!verification) {
      return null
    }

    const now = new Date()
    if (now > verification.expiresAt) {
      return null
    }

    return Math.floor((verification.expiresAt.getTime() - now.getTime()) / 1000)
  }
}
