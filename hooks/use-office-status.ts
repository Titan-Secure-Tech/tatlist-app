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

    return () => clearInterval(interval)
  }, [])

  return status
}
