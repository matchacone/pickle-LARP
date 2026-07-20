'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Check, CircleCheck } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-asphalt p-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="absolute bottom-0 right-0 opacity-10" width="420" height="420" viewBox="0 0 420 420" fill="none">
          <rect x="40" y="40" width="340" height="340" rx="4" stroke="#D1FE00" strokeWidth="2"/>
          <line x1="210" y1="40" x2="210" y2="380" stroke="#D1FE00" strokeWidth="1.5" strokeDasharray="6 4"/>
          <line x1="40" y1="150" x2="380" y2="150" stroke="#D1FE00" strokeWidth="1.5"/>
          <line x1="40" y1="270" x2="380" y2="270" stroke="#D1FE00" strokeWidth="1.5"/>
          <line x1="40" y1="210" x2="380" y2="210" stroke="white" strokeWidth="2.5"/>
          <circle cx="210" cy="210" r="24" stroke="#D1FE00" strokeWidth="1.5"/>
        </svg>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: '#D1FE00', filter: 'blur(80px)' }} />
      </div>

      <Link href="/" className="flex items-center gap-2 relative z-10">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-green">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="14" height="14" rx="1" stroke="#121212" strokeWidth="1.5"/>
            <line x1="9" y1="2" x2="9" y2="16" stroke="#121212" strokeWidth="1.5"/>
            <line x1="2" y1="9" x2="16" y2="9" stroke="#121212" strokeWidth="1"/>
          </svg>
        </span>
        <span className="text-white font-extrabold text-xl tracking-tight">Pick-All</span>
      </Link>

      <div className="relative z-10">
        <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
          Join thousands of players booking courts
          <span style={{ color: '#D1FE00' }}> every day.</span>
        </h2>
        <ul className="mt-8 flex flex-col gap-3">
          {[
            'Access 500+ courts across the Philippines',
            'Book in under 60 seconds, no account needed to browse',
            'Manage all your bookings in one dashboard',
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-white/70 font-medium">
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FE0022', border: '1px solid #D1FE0044' }}>
                <Check size={10} color="#D1FE00" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Stats row */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Courts' },
            { value: '12K+', label: 'Players' },
            { value: '4.9★', label: 'Rating' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-extrabold" style={{ color: '#D1FE00' }}>{s.value}</p>
              <p className="text-xs text-white/50 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setOauthLoading(true)
    const supabase = createBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#D1FE0020' }}>
            <CircleCheck size={32} color="#526600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-asphalt">Check your inbox!</h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            We sent a confirmation link to <strong className="text-asphalt">{email}</strong>.
            Click the link to activate your account and start booking.
          </p>
          <Link href="/login" className="btn btn-primary w-full justify-center mt-8">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col items-center justify-center p-8 lg:p-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-asphalt">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="1" stroke="#D1FE00" strokeWidth="1.5"/>
              <line x1="9" y1="2" x2="9" y2="16" stroke="#D1FE00" strokeWidth="1.5"/>
            </svg>
          </span>
          <span className="font-extrabold text-asphalt text-lg">Pick-All</span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="text-3xl font-extrabold text-asphalt tracking-tight">Create your account</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>

          {/* Google OAuth */}
          <button
            id="register-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading || loading}
            className="btn btn-outline w-full justify-center gap-3 mt-8 text-sm"
          >
            {oauthLoading ? <span className="spinner" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline" />
            <span className="text-xs font-semibold text-on-surface-variant">or sign up with email</span>
            <div className="flex-1 h-px bg-outline" />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              {error}
            </div>
          )}

          <form id="register-form" onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Email address
              </label>
              <input
                id="register-email"
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-confirm" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary w-full justify-center gap-2 mt-2 py-3"
              disabled={loading}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-on-surface-variant text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="#" className="underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
