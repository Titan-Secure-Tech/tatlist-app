'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, AlertCircle, CheckCircle2, Loader2, Copy } from 'lucide-react'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

interface BusinessHoursEditorProps {
  userId: string
  initialHours?: BusinessHours | null
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
}

const DAYS: Array<keyof BusinessHours> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const DAY_LABELS: Record<keyof BusinessHours, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export function BusinessHoursEditor({ userId, initialHours }: BusinessHoursEditorProps) {
  const [hours, setHours] = useState<BusinessHours>(initialHours || DEFAULT_HOURS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copySource, setCopySource] = useState<keyof BusinessHours | ''>('')
  const supabase = createClient()

  const handleDayChange = (
    day: keyof BusinessHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleCopyHours = () => {
    if (!copySource) return

    const sourceHours = hours[copySource]
    const newHours = { ...hours }

    DAYS.forEach(day => {
      if (day !== copySource) {
        newHours[day] = { ...sourceHours }
      }
    })

    setHours(newHours)
    setCopySource('')
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          business_hours: hours,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business hours')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner for users without business hours */}
      {!initialHours && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">Action Required</h3>
            <p className="text-sm text-amber-800 mt-1">
              Please set your business hours to help us schedule deliveries at optimal times.
            </p>
          </div>
        </div>
      )}

      {/* Copy Hours Helper */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Setup</h3>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="copySource" className="block text-xs font-medium text-gray-700 mb-1">
              Copy hours from:
            </label>
            <select
              id="copySource"
              value={copySource}
              onChange={e => setCopySource(e.target.value as keyof BusinessHours)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-black focus:border-black"
            >
              <option value="">Select a day...</option>
              {DAYS.map(day => (
                <option key={day} value={day}>
                  {DAY_LABELS[day]} (
                  {hours[day].closed ? 'Closed' : `${hours[day].open} - ${hours[day].close}`})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCopyHours}
            disabled={!copySource}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <Copy className="h-4 w-4" />
            Copy to All Days
          </button>
        </div>
      </div>

      {/* Hours for Each Day */}
      <div className="space-y-3">
        {DAYS.map(day => (
          <div
            key={day}
            className={`p-4 border rounded-lg ${hours[day].closed ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">{DAY_LABELS[day]}</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours[day].closed}
                  onChange={e => handleDayChange(day, 'closed', e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Closed</span>
              </label>
            </div>

            {!hours[day].closed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`${day}-open`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Opening Time
                  </label>
                  <input
                    id={`${day}-open`}
                    type="time"
                    value={hours[day].open}
                    onChange={e => handleDayChange(day, 'open', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${day}-close`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Closing Time
                  </label>
                  <input
                    id={`${day}-close`}
                    type="time"
                    value={hours[day].close}
                    onChange={e => handleDayChange(day, 'close', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Save Business Hours
            </>
          )}
        </button>

        {success && (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Saved successfully!</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Why we need your business hours:
        </h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Helps us schedule deliveries when you&apos;re open to receive them</li>
          <li>• Allows customers to know when they can expect delivery</li>
          <li>• Improves delivery efficiency and reduces missed deliveries</li>
        </ul>
      </div>
    </div>
  )
}
