'use client'

import { useState, useEffect } from 'react'
import AnnouncementBanner from '@/components/announcement-banner'
import AnimatedNavigation from '@/components/layout/AnimatedNavigation'

interface DashboardWrapperProps {
  children: React.ReactNode
  isAdmin: boolean
}

export default function DashboardWrapper({ children, isAdmin }: DashboardWrapperProps) {
  const [paddingTop, setPaddingTop] = useState('pt-32') // Default with banner

  useEffect(() => {
    const checkBannerState = () => {
      const bannerClosed = sessionStorage.getItem('announcementBannerClosed')
      // If banner is closed, use less padding (just for nav)
      // If banner is open, use more padding (for banner + nav)
      setPaddingTop(bannerClosed === 'true' ? 'pt-24' : 'pt-32')
    }

    // Initial check
    checkBannerState()

    // Check periodically for changes
    const interval = setInterval(checkBannerState, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <AnnouncementBanner />
      <AnimatedNavigation isAdmin={isAdmin} />
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingTop} pb-8 transition-all duration-300`}
      >
        {children}
      </main>
    </>
  )
}
