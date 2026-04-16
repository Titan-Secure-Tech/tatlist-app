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
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-warning">Action Required</h3>
            <p className="text-sm text-warning mt-1">
              Please set your business hours to help us schedule deliveries at optimal times.
            </p>
          </div>
        </div>
      )}

      {/* Copy Hours Helper */}
      <div className="p-4 bg-muted border border-border rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Setup</h3>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="copySource" className="block text-xs font-medium text-foreground mb-1">
              Copy hours from:
            </label>
            <select
              id="copySource"
              value={copySource}
              onChange={e => setCopySource(e.target.value as keyof BusinessHours)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-brand focus:border-brand"
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
            className="px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
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
            className={`p-4 border rounded-xl ${hours[day].closed ? 'bg-muted border-border' : 'bg-background border-border'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">{DAY_LABELS[day]}</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours[day].closed}
                  onChange={e => handleDayChange(day, 'closed', e.target.checked)}
                  className="h-4 w-4 text-foreground focus:ring-brand border-border rounded"
                />
                <span className="text-sm text-foreground">Closed</span>
              </label>
            </div>

            {!hours[day].closed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`${day}-open`}
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Opening Time
                  </label>
                  <input
                    id={`${day}-open`}
                    type="time"
                    value={hours[day].open}
                    onChange={e => handleDayChange(day, 'open', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${day}-close`}
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Closing Time
                  </label>
                  <input
                    id={`${day}-close`}
                    type="time"
                    value={hours[day].close}
                    onChange={e => handleDayChange(day, 'close', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Saved successfully!</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
        <h4 className="text-sm font-semibold text-info mb-2">
          Why we need your business hours:
        </h4>
        <ul className="space-y-1 text-sm text-info">
          <li>• Helps us schedule deliveries when you&apos;re open to receive them</li>
          <li>• Allows customers to know when they can expect delivery</li>
          <li>• Improves delivery efficiency and reduces missed deliveries</li>
        </ul>
      </div>
    </div>
  )
}
