'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Lock, Loader2, CheckCircle2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/courts')
        router.refresh()
      }, 3000)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 animate-fadeUp">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-pickle-100 dark:bg-pickle-900/30 text-pickle-600 rounded-xl flex items-center justify-center">
            <Lock size={24} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Update Password
        </h1>
        <p className="text-slate-500 text-center mb-8">
          Please enter your new password below.
        </p>

        {success ? (
          <div className="text-center space-y-4 animate-fadeUp">
            <div className="flex justify-center">
              <CheckCircle2 className="text-green-500 w-16 h-16" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Password updated successfully!
            </p>
            <p className="text-sm text-slate-500">
              Redirecting you to the courts...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full"
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full btn btn-primary py-2.5 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Password'}
            </button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remember your old password?{' '}
              <Link href="/login" className="text-pickle-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
