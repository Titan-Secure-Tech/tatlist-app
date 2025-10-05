import { flag } from 'flags/next'

/**
 * Feature flag for controlling office status
 * When true: Office is open and accepting orders
 * When false: Office is out of office, orders are paused
 */
export const isOfficeOpen = flag<boolean>({
  key: 'office-open',
  defaultValue: true,
  description: 'Controls whether the office is open and accepting orders',
  decide() {
    // Default to open during business hours (Mon-Sat, 9am-6pm EST)
    // This can be overridden in Vercel dashboard or via environment variable
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 6 = Saturday
    const hour = now.getHours()

    // Closed on Sundays (day === 0)
    if (day === 0) return false

    // Open Monday-Saturday, 9am-6pm
    return hour >= 9 && hour < 18
  },
})
