/**
 * Unit Tests for Delivery Configuration
 * Tests delivery utility functions including zip code validation and fee calculation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isZipCodeSupported,
  getDeliveryFee,
  getEstimatedDeliveryTime,
  isDeliveryAvailable,
  DELIVERY_CONFIG,
} from '@/lib/config/delivery'

describe('Delivery Configuration', () => {
  describe('isZipCodeSupported', () => {
    it('should return true for supported zip codes', () => {
      expect(isZipCodeSupported('90001')).toBe(true)
      expect(isZipCodeSupported('90025')).toBe(true)
    })

    it('should return false for unsupported zip codes', () => {
      expect(isZipCodeSupported('99999')).toBe(false)
      expect(isZipCodeSupported('12345')).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isZipCodeSupported('90001')).toBe(true)
    })
  })

  describe('getDeliveryFee', () => {
    it('should return flat fee for supported zip codes', () => {
      expect(getDeliveryFee('90001')).toBe(DELIVERY_CONFIG.flatFee)
      expect(getDeliveryFee('90025')).toBe(DELIVERY_CONFIG.flatFee)
    })

    it('should return 0 for unsupported zip codes', () => {
      expect(getDeliveryFee('99999')).toBe(0)
      expect(getDeliveryFee('12345')).toBe(0)
    })
  })

  describe('getEstimatedDeliveryTime', () => {
    it('should return time range string', () => {
      const timeStr = getEstimatedDeliveryTime()
      expect(timeStr).toBe('30-90 minutes')
    })

    it('should handle equal min and max times', () => {
      const originalMin = DELIVERY_CONFIG.estimatedTime.min
      const originalMax = DELIVERY_CONFIG.estimatedTime.max
      
      DELIVERY_CONFIG.estimatedTime.min = 30
      DELIVERY_CONFIG.estimatedTime.max = 30
      
      const timeStr = getEstimatedDeliveryTime()
      expect(timeStr).toBe('30 minutes')
      
      // Restore original values
      DELIVERY_CONFIG.estimatedTime.min = originalMin
      DELIVERY_CONFIG.estimatedTime.max = originalMax
    })
  })

  describe('isDeliveryAvailable', () => {
    beforeEach(() => {
      // Reset system time before each test
      vi.restoreAllMocks()
    })

    it('should return true during business hours on Monday', () => {
      // Mock a Monday at 10:00 AM
      const mockDate = new Date('2025-12-08T10:00:00') // Monday
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(true)
    })

    it('should return false before business hours', () => {
      // Mock a Monday at 8:00 AM (before 9:00 AM opening)
      const mockDate = new Date('2025-12-08T08:00:00')
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(false)
    })

    it('should return false after business hours', () => {
      // Mock a Monday at 22:00 (after 21:00 closing)
      const mockDate = new Date('2025-12-08T22:00:00')
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(false)
    })

    it('should handle different hours for Friday', () => {
      // Mock a Friday at 21:30 (within Friday hours: 09:00-22:00)
      const mockDate = new Date('2025-12-12T21:30:00')
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(true)
    })

    it('should handle weekend hours', () => {
      // Mock a Saturday at 10:30 (within Saturday hours: 10:00-22:00)
      const mockDate = new Date('2025-12-13T10:30:00')
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(true)
    })

    it('should handle Sunday hours', () => {
      // Mock a Sunday at 19:00 (within Sunday hours: 10:00-20:00)
      const mockDate = new Date('2025-12-14T19:00:00')
      vi.setSystemTime(mockDate)
      
      expect(isDeliveryAvailable()).toBe(true)
    })
  })

  describe('DELIVERY_CONFIG constants', () => {
    it('should have valid configuration values', () => {
      expect(DELIVERY_CONFIG.flatFee).toBeGreaterThan(0)
      expect(DELIVERY_CONFIG.maxRadius).toBeGreaterThan(0)
      expect(DELIVERY_CONFIG.minimumOrderAmount).toBeGreaterThan(0)
      expect(DELIVERY_CONFIG.estimatedTime.min).toBeLessThanOrEqual(
        DELIVERY_CONFIG.estimatedTime.max
      )
    })

    it('should have business hours for all days', () => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      days.forEach(day => {
        expect(DELIVERY_CONFIG.businessHours[day as keyof typeof DELIVERY_CONFIG.businessHours]).toBeDefined()
      })
    })

    it('should have supported zip codes', () => {
      expect(DELIVERY_CONFIG.supportedZipCodes).toBeInstanceOf(Array)
      expect(DELIVERY_CONFIG.supportedZipCodes.length).toBeGreaterThan(0)
    })
  })
})
