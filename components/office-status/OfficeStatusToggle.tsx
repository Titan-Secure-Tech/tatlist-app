'use client'

import { useState } from 'react'
import { useOfficeStatus } from '@/lib/store/office-status-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface OfficeStatusToggleProps {
  showDetails?: boolean
  showNote?: boolean
  updatedBy?: string
  className?: string
}

export function OfficeStatusToggle({ 
  showDetails = true, 
  showNote = false, 
  updatedBy,
  className 
}: OfficeStatusToggleProps) {
  const { 
    status, 
    isInOffice, 
    lastUpdated, 
    note: currentNote,
    setStatus, 
    toggleStatus 
  } = useOfficeStatus()
  
  const [note, setNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      toggleStatus(updatedBy, showNote ? note : undefined)
      if (showNote) {
        setNote('')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: 'in-office' | 'out-of-office') => {
    setIsUpdating(true)
    try {
      setStatus(newStatus, updatedBy, showNote ? note : undefined)
      if (showNote) {
        setNote('')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const formatLastUpdated = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Unknown'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Office Status
          <Badge variant={isInOffice ? 'default' : 'secondary'}>
            {isInOffice ? 'In Office' : 'Out of Office'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Toggle between in-office and out-of-office status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="office-status"
            checked={isInOffice}
            onCheckedChange={(checked) => 
              handleStatusChange(checked ? 'in-office' : 'out-of-office')
            }
            disabled={isUpdating}
          />
          <Label htmlFor="office-status" className="text-sm font-medium">
            {isInOffice ? 'Currently in office' : 'Currently out of office'}
          </Label>
        </div>

        {showNote && (
          <div className="space-y-2">
            <Label htmlFor="status-note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <Input
              id="status-note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isUpdating}
            />
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={handleToggle}
            disabled={isUpdating}
            size="sm"
            variant="outline"
          >
            {isUpdating ? 'Updating...' : 'Toggle Status'}
          </Button>
        </div>

        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              <div>Last updated: {formatLastUpdated(lastUpdated)}</div>
              {currentNote && (
                <div className="mt-1">
                  <span className="font-medium">Note:</span> {currentNote}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}