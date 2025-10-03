'use client'

import { useOfficeStatus } from '@/lib/store/office-status-store'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OfficeStatusIndicatorProps {
  variant?: 'default' | 'outline' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  className?: string
}

export function OfficeStatusIndicator({ 
  variant = 'default',
  size = 'default',
  showIcon = true,
  className 
}: OfficeStatusIndicatorProps) {
  const { status, isInOffice } = useOfficeStatus()

  const getStatusColor = () => {
    if (variant === 'minimal') {
      return isInOffice ? 'text-green-600' : 'text-orange-600'
    }
    return isInOffice ? 'default' : 'secondary'
  }

  const getStatusIcon = () => {
    if (!showIcon) return null
    return isInOffice ? '🟢' : '🟠'
  }

  const getStatusText = () => {
    return isInOffice ? 'In Office' : 'Out of Office'
  }

  if (variant === 'minimal') {
    return (
      <span className={cn('text-sm font-medium', getStatusColor(), className)}>
        {getStatusIcon()} {getStatusText()}
      </span>
    )
  }

  return (
    <Badge 
      variant={getStatusColor() as any}
      className={cn(
        size === 'sm' && 'text-xs px-2 py-1',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
    >
      {getStatusIcon()} {getStatusText()}
    </Badge>
  )
}