'use client'

import { useSandbox } from '@/lib/contexts/sandbox-context'
import { Badge } from '@/components/ui/badge'

export function SandboxIndicator() {
  const { isSandboxMode, userEmail } = useSandbox()

  if (!isSandboxMode) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        🧪 Sandbox Mode
      </Badge>
      {userEmail && (
        <span className="text-xs text-muted-foreground hidden sm:inline">({userEmail})</span>
      )}
    </div>
  )
}
