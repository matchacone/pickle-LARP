'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { ChevronLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      {/* Back link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-asphalt transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Back to login
        </Link>
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-asphalt flex items-center justify-center mb-6">
          <Mail size={24} color="#D1FE00" aria-hidden="true" />
        </div>

        {!sent ? (
          <>
            <h1 className="text-3xl font-extrabold text-asphalt tracking-tight">Forgot password?</h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              No worries. Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                {error}
              </div>
            )}

            <form id="forgot-password-form" onSubmit={handleReset} className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <button
                id="forgot-submit"
                type="submit"
                className="btn btn-primary w-full justify-center gap-2 py-3"
                disabled={loading}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-center mt-6">
              <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </>
        ) : (
          /* Success state */
          <div className="animate-fade-up">
            <h1 className="text-3xl font-extrabold text-asphalt tracking-tight">Check your inbox</h1>
            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
              We sent a password reset link to{' '}
              <strong className="text-asphalt">{email}</strong>.
              The link expires in 1 hour.
            </p>
            <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: '#D1FE0012', border: '1px solid #D1FE0030' }}>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Didn&apos;t receive it? Check your spam folder, or{' '}
                <button
                  className="font-bold text-primary underline cursor-pointer"
                  onClick={() => setSent(false)}
                >
                  try again
                </button>.
              </p>
            </div>
            <Link href="/login" className="btn btn-primary w-full justify-center mt-8">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
