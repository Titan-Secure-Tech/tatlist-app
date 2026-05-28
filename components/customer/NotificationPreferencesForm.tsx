/**
 * Notification Preferences Form Component
 *
 * Form for customers to manage their delivery alert preferences
 * Issue #55: Implement Geolocation Alerts
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type NotificationChannel = 'email' | 'sms' | 'both'

interface NotificationPreferences {
  id: string
  user_id: string
  preferred_channel: NotificationChannel
  email_enabled: boolean
  sms_enabled: boolean
  phone_number: string | null
  phone_verified: boolean
  enable_eta_alerts: boolean
  enable_distance_alerts: boolean
  enable_arrival_alerts: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

interface NotificationPreferencesFormProps {
  preferences: NotificationPreferences
}

export function NotificationPreferencesForm({ preferences }: NotificationPreferencesFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(preferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Verification state
  const [verificationState, setVerificationState] = useState<
    'idle' | 'sending' | 'code_sent' | 'verifying'
  >('idle')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/customer/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      setMessage({
        type: 'success',
        text: 'Preferences updated successfully!',
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating preferences:', error)
      setMessage({
        type: 'error',
        text: 'Failed to update preferences. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Countdown timer for code expiry
  useEffect(() => {
    if (expiresIn === null || expiresIn <= 0) {
      return
    }

    const timer = setInterval(() => {
      setExpiresIn(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresIn])

  const handleSendVerificationCode = async () => {
    if (!formData.phone_number) {
      setVerificationError('Please enter a phone number')
      return
    }

    setVerificationState('sending')
    setVerificationError(null)

    try {
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phone_number }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setVerificationState('code_sent')
      setExpiresIn(600) // 10 minutes in seconds
      setVerificationCode('')
    } catch (error) {
      console.error('Error sending verification code:', error)
      setVerificationError(
        error instanceof Error ? error.message : 'Failed to send verification code'
      )
      setVerificationState('idle')
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter a 6-digit verification code')
      return
    }

    setVerificationState('verifying')
    setVerificationError(null)

    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phone_number,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Update form data to reflect verified status
      setFormData({ ...formData, phone_verified: true })
      setVerificationState('idle')
      setVerificationCode('')
      setMessage({
        type: 'success',
        text: 'Phone number verified successfully!',
      })

      // Refresh page to update UI
      router.refresh()
    } catch (error) {
      console.error('Error verifying code:', error)
      setVerificationError(error instanceof Error ? error.message : 'Failed to verify code')
      setVerificationState('code_sent')
    }
  }

  const handleResendCode = () => {
    setVerificationCode('')
    setVerificationError(null)
    handleSendVerificationCode()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Channels</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={e =>
                  setFormData({
                    ...formData,
                    email_enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">Email Notifications</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">Receive delivery alerts via email</p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.sms_enabled}
                onChange={e => setFormData({ ...formData, sms_enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Receive delivery alerts via text message
            </p>

            {formData.sms_enabled && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={e => {
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                        // Reset verification state when phone number changes
                        if (verificationState !== 'idle') {
                          setVerificationState('idle')
                          setVerificationCode('')
                          setVerificationError(null)
                        }
                      }}
                      placeholder="+1 (555) 123-4567"
                      disabled={
                        verificationState === 'sending' || verificationState === 'verifying'
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    />
                    {formData.phone_number &&
                      !formData.phone_verified &&
                      verificationState === 'idle' && (
                        <button
                          type="button"
                          onClick={handleSendVerificationCode}
                          disabled={verificationState === 'sending'}
                          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                          {verificationState === 'sending' ? 'Sending...' : 'Send Code'}
                        </button>
                      )}
                  </div>

                  {/* Verification Code Input */}
                  {verificationState === 'code_sent' && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-900 mb-3">
                        We&apos;ve sent a 6-digit verification code to{' '}
                        <span className="font-medium">{formData.phone_number}</span>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '')
                            if (value.length <= 6) {
                              setVerificationCode(value)
                            }
                          }}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-center text-lg tracking-widest font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={verificationCode.length !== 6}
                          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {expiresIn && expiresIn > 0 ? (
                          <p className="text-xs text-blue-700">
                            Code expires in {Math.floor(expiresIn / 60)}:
                            {String(expiresIn % 60).padStart(2, '0')}
                          </p>
                        ) : (
                          <p className="text-xs text-red-600">Code expired</p>
                        )}
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-xs text-blue-700 hover:text-blue-900 underline"
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  )}

                  {verificationState === 'verifying' && (
                    <p className="text-sm text-blue-600 mt-2">Verifying code...</p>
                  )}

                  {/* Verification Error */}
                  {verificationError && (
                    <p className="text-sm text-red-600 mt-2">{verificationError}</p>
                  )}

                  {/* Verification Success */}
                  {formData.phone_verified && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Phone number verified - you&apos;ll receive SMS alerts
                    </p>
                  )}

                  {/* Not Verified Warning */}
                  {formData.phone_number &&
                    !formData.phone_verified &&
                    verificationState === 'idle' && (
                      <p className="text-sm text-orange-600 mt-2">
                        ⚠ Phone number not verified. SMS alerts will not be sent until verified.
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Alert Types</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose which delivery alerts you want to receive
        </p>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_eta_alerts}
                onChange={e =>
                  setFormData({
                    ...formData,
                    enable_eta_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">⏱️ ETA Alerts</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is 10 minutes, 5 minutes away
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_distance_alerts}
                onChange={e =>
                  setFormData({
                    ...formData,
                    enable_distance_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">🚗 Distance Alerts</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is 2 miles, 1 mile, 0.5 miles away
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_arrival_alerts}
                onChange={e =>
                  setFormData({
                    ...formData,
                    enable_arrival_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">📍 Arrival Alert</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is arriving now (urgent)
            </p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quiet Hours</h2>
        <p className="text-sm text-gray-600 mb-4">
          Set hours when you don&apos;t want to receive notifications
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formData.quiet_hours_start || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  quiet_hours_start: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={formData.quiet_hours_end || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  quiet_hours_end: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {formData.quiet_hours_start && formData.quiet_hours_end && (
          <p className="text-sm text-gray-600 mt-2">
            No notifications between {formData.quiet_hours_start} and {formData.quiet_hours_end}
          </p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  )
}
