'use client'

import { ReactNode } from 'react'

interface CartProviderProps {
  children: ReactNode
}

// Simple wrapper component since we're using Zustand for state management
export function CartProvider({ children }: CartProviderProps) {
  return <>{children}</>
}
