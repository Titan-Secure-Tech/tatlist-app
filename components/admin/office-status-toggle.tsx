'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useOfficeStatus } from '@/hooks/use-office-status'
import { Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function OfficeStatusToggle() {
  const { isOpen, message, hours } = useOfficeStatus()
  const [isOverridden, setIsOverridden] = useState(false)
  const [overrideValue, setOverrideValue] = useState(true)

  useEffect(() => {
    // Check if there's a stored override in localStorage
    const storedOverride = localStorage.getItem('office-status-override')
    if (storedOverride) {
      const override = JSON.parse(storedOverride)
      setIsOverridden(override.enabled)
      setOverrideValue(override.value)
    }
  }, [])

  const handleToggle = (checked: boolean) => {
    setOverrideValue(checked)
    setIsOverridden(true)

    // Store override in localStorage
    localStorage.setItem(
      'office-status-override',
      JSON.stringify({
        enabled: true,
        value: checked,
      })
    )

    toast.success(checked ? 'Office status set to OPEN' : 'Office status set to CLOSED', {
      description: 'This override will persist until cleared',
    })
  }

  const clearOverride = () => {
    setIsOverridden(false)
    localStorage.removeItem('office-status-override')
    toast.info('Override cleared', {
      description: 'Office status will follow normal business hours',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Office Status Control</h3>
        <p className="text-sm text-gray-600">
          Manually override the office status to control order processing and availability
          messaging.
        </p>
      </div>

      {/* Current Status */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-shrink-0">
          {isOpen ? (
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
            <Clock className="w-4 h-4" />
            {hours}
          </p>
        </div>
      </div>

      {/* Manual Override */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Label htmlFor="office-status" className="text-sm font-medium">
            Manual Override
          </Label>
          <Switch
            id="office-status"
            checked={isOverridden ? overrideValue : isOpen}
            onCheckedChange={handleToggle}
          />
        </div>

        {isOverridden && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              Override is active: Office is {overrideValue ? 'OPEN' : 'CLOSED'}
            </p>
            <button
              onClick={clearOverride}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              Clear Override
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500">
          When enabled, this will override the automatic business hours schedule. Use this to
          manually close the office for holidays or unexpected closures, or to open outside of
          normal hours.
        </p>
      </div>
    </div>
  )
}
