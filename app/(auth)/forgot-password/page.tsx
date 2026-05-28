'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-secondary rounded-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="text-sm bg-brand/10 text-foreground p-4 rounded-xl border border-brand/20">
                If an account exists for <span className="font-medium">{email}</span>, a password
                reset link has been sent. Check your inbox (and spam folder).
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-secondary-gradient text-foreground font-medium py-3 px-4 rounded-xl border border-border hover:bg-accent transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground font-medium py-3 px-4 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
