'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SandboxContextType {
  isSandboxMode: boolean
  setSandboxMode: (mode: boolean) => void
  userEmail: string | null
  setUserEmail: (email: string | null) => void
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined)

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [isSandboxMode, setIsSandboxMode] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check localStorage for sandbox state on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('tatlist-user-email')
    const savedSandboxMode = localStorage.getItem('tatlist-sandbox-mode') === 'true'

    if (savedEmail) {
      setUserEmail(savedEmail)
    }
    if (savedSandboxMode) {
      setIsSandboxMode(savedSandboxMode)
    }
  }, [])

  const setSandboxMode = (mode: boolean) => {
    setIsSandboxMode(mode)
    localStorage.setItem('tatlist-sandbox-mode', mode.toString())
  }

  const updateUserEmail = (email: string | null) => {
    setUserEmail(email)
    if (email) {
      localStorage.setItem('tatlist-user-email', email)

      // Check if this email should trigger sandbox mode
      const sandboxEmails = ['crushjunkmail@gmail.com', 'james@familiawashington.com']
      const shouldUseSandbox = sandboxEmails.includes(email.toLowerCase())
      setSandboxMode(shouldUseSandbox)
    } else {
      localStorage.removeItem('tatlist-user-email')
      setSandboxMode(false)
    }
  }

  return (
    <SandboxContext.Provider
      value={{
        isSandboxMode,
        setSandboxMode,
        userEmail,
        setUserEmail: updateUserEmail,
      }}
    >
      {children}
    </SandboxContext.Provider>
  )
}

export function useSandbox() {
  const context = useContext(SandboxContext)
  if (context === undefined) {
    throw new Error('useSandbox must be used within a SandboxProvider')
  }
  return context
}
