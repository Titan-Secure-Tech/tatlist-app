'use client'

import { ReactNode, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cart-store'

interface CartProviderProps {
  children: ReactNode
}

// Cart provider that syncs cart state with authenticated user
export function CartProvider({ children }: CartProviderProps) {
  const setUserId = useCartStore(state => state.setUserId)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUserId, supabase])

  return <>{children}</>
}
