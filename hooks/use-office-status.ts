'use client'

import { useEffect, useState } from 'react'

export interface OfficeStatus {
  isOpen: boolean
  message: string
  hours: string
}

/**
 * Client-side hook for checking office status
 * This provides real-time updates for office hours and availability
 */
export function useOfficeStatus(): OfficeStatus {
  const [status, setStatus] = useState<OfficeStatus>({
    isOpen: true,
    message: 'We are currently open and accepting orders',
    hours: 'Monday-Saturday, 9am-6pm',
  })

  useEffect(() => {
    const checkStatus = () => {
      // Check for manual override first
      const storedOverride = localStorage.getItem('office-status-override')
      if (storedOverride) {
        try {
          const override = JSON.parse(storedOverride)
          if (override.enabled) {
            setStatus({
              isOpen: override.value,
              message: override.value
                ? 'Office is manually set to OPEN'
                : 'Office is manually set to CLOSED',
              hours: 'Monday-Saturday, 9am-6pm',
            })
            return
          }
        } catch {
          // Invalid override data, ignore and continue with normal logic
          localStorage.removeItem('office-status-override')
        }
      }

      const now = new Date()
      const day = now.getDay() // 0 = Sunday, 6 = Saturday
      const hour = now.getHours()

      // Closed on Sundays
      if (day === 0) {
        setStatus({
          isOpen: false,
          message: 'We are closed on Sundays',
          hours: 'Monday-Saturday, 9am-6pm',
        })
        return
      }

      // Check business hours (9am-6pm)
      if (hour < 9) {
        setStatus({
          isOpen: false,
          message: `We open at 9am today`,
          hours: 'Monday-Saturday, 9am-6pm',
        })
      } else if (hour >= 18) {
        setStatus({
          isOpen: false,
          message: 'We are currently closed. We open at 9am tomorrow',
          hours: 'Monday-Saturday, 9am-6pm',
        })
      } else {
        setStatus({
          isOpen: true,
          message: 'We are currently open and accepting orders',
          hours: 'Monday-Saturday, 9am-6pm',
        })
      }
    }

    // Check immediately
    checkStatus()

    // Check every minute
    const interval = setInterval(checkStatus, 60000)

    // Listen for storage changes (manual override in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'office-status-override') {
        checkStatus()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return status
}
