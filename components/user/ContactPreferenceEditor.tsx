'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, MessageSquare, BellRing, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface ContactPreferenceEditorProps {
  userId: string
  initialPreference?: 'sms' | 'email' | 'both' | null
  initialPhone?: string | null
}

export function ContactPreferenceEditor({
  userId,
  initialPreference,
  initialPhone,
}: ContactPreferenceEditorProps) {
  const [preference, setPreference] = useState<'sms' | 'email' | 'both' | ''>(
    initialPreference || ''
  )
  const [phone, setPhone] = useState(initialPhone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    // Validate phone if SMS is selected
    if ((preference === 'sms' || preference === 'both') && !phone.trim()) {
      setError('Phone number is required for SMS notifications')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          contact_preference: preference,
          phone: phone.trim() || null,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner for users without preference */}
      {!initialPreference && (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-warning">Action Required</h3>
            <p className="text-sm text-warning mt-1">
              Please set your contact preference to receive order updates and delivery
              notifications.
            </p>
          </div>
        </div>
      )}

      {/* Contact Preference Selection */}
      <div>
        <label htmlFor="contactPreference" className="block text-sm font-medium text-foreground mb-2">
          Preferred Contact Method {!initialPreference && <span className="text-destructive">*</span>}
        </label>
        <select
          id="contactPreference"
          value={preference}
          onChange={e => setPreference(e.target.value as 'sms' | 'email' | 'both')}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
        >
          <option value="">Select your preference...</option>
          <option value="email">📧 Email only</option>
          <option value="sms">💬 SMS/Text only</option>
          <option value="both">📧 💬 Both Email and SMS</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          We&apos;ll use this to send you order confirmations, status updates, and delivery
          notifications.
        </p>
      </div>

      {/* Phone Number (shown when SMS is selected) */}
      {(preference === 'sms' || preference === 'both') && (
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
            placeholder="(555) 123-4567"
          />
          <p className="mt-1 text-xs text-muted-foreground">Required for SMS notifications</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading || !preference}
          className="px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <BellRing className="h-4 w-4" />
              Save Preferences
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
      <div className="mt-6 p-4 bg-muted border border-border rounded-xl">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          How we use your contact preference:
        </h4>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>
              <strong>Email:</strong> Order confirmations, receipts, and detailed updates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>
              <strong>SMS:</strong> Quick delivery alerts and time-sensitive notifications
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BellRing className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>
              <strong>Both:</strong> Comprehensive coverage with all communication types
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
