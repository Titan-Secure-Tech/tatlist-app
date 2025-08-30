'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function OAuthHandler() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      // If there's an OAuth code on the homepage, redirect to the proper callback handler
      const currentUrl = new URL(window.location.href)
      const callbackUrl = new URL('/api/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('code', code)

      // Preserve any other parameters
      currentUrl.searchParams.forEach((value, key) => {
        if (key !== 'code') {
          callbackUrl.searchParams.set(key, value)
        }
      })

      window.location.href = callbackUrl.toString()
    }
  }, [code])

  return null
}
