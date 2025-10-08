'use client'

import { ReactNode } from 'react'

interface CartProviderProps {
  children: ReactNode
}

// Simple wrapper component since we're using Zustand for state management
// Cart state persists in localStorage with a single key for all users
// This is acceptable since each user is manually verified as a legitimate tattoo shop
export function CartProvider({ children }: CartProviderProps) {
  return <>{children}</>
}
