import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

export default function PartnerLoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  const showToast = useStore(state => state.showToast)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    try {
      await login(email, password, 'partner')
      showToast('Welcome back, Partner!', 'success')
      navigate('/partner')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col fade-in">
      {/* Teal gradient header */}
      <div
        className="relative flex flex-col items-center justify-center pt-14 pb-20 px-4"
        style={{ background: 'linear-gradient(140deg, #042f2e 0%, #0f766e 52%, #0d9488 120%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-brand text-2xl font-bold text-white tracking-tight leading-tight">
              HomeCare
            </span>
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase -mt-0.5">
              Partner Portal
            </span>
          </div>
        </div>
        <p className="text-white/60 text-sm">Manage your jobs, earnings &amp; schedule</p>
      </div>

      {/* Card overlapping header */}
      <div className="flex-1 flex flex-col items-center px-4 -mt-10 pb-10">
        <div className="w-full max-w-md glass-card overflow-hidden">
          <div className="p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-brand text-xl font-bold text-primary">Sign in to your account</h2>
              <p className="text-muted text-sm mt-1">Access your partner dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10">
                  {formError}
                </div>
              )}
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="partner-email" className="text-xs font-semibold text-secondary">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="partner-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-base w-full pl-9 pr-4 py-3 text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="partner-password" className="text-xs font-semibold text-secondary">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="partner-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input-base w-full pl-9 pr-10 py-3 text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-base w-full py-3 text-sm font-semibold text-white mt-1 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-muted">
              Not a partner yet?{' '}
              <button className="font-semibold hover:underline" style={{ color: '#0d9488' }}>
                Apply to join
              </button>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Use your registered partner credentials
        </p>
      </div>
    </div>
  )
}
