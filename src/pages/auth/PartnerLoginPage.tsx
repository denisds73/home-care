import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { loginSchema, DASHBOARD_ROUTES } from '../../lib/auth'
import type { LoginFormData } from '../../lib/auth'

export default function PartnerLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const clearError = useAuthStore((state) => state.clearError)
  const isLoading = useAuthStore((state) => state.isLoading)
  const serverError = useAuthStore((state) => state.error)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)

  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const returnTo = searchParams.get('returnTo')

  // Redirect if already authenticated as partner
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(returnTo ?? DASHBOARD_ROUTES[role] ?? '/partner', { replace: true })
    }
  }, [isAuthenticated, role, navigate, returnTo])

  // Clear server error on mount
  useEffect(() => { clearError() }, [clearError])

  const validation = loginSchema.safeParse(form)
  const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof LoginFormData
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
  }

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (serverError) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (!validation.success) {
      const firstInvalid = validation.error.issues[0]?.path[0]
      if (firstInvalid === 'email') emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    await login(form.email, form.password)
    const dest = returnTo ?? DASHBOARD_ROUTES['partner'] ?? '/partner'
    navigate(dest, { replace: true })
  }

  const emailError = touched.email ? fieldErrors.email : undefined
  const passwordError = touched.password ? fieldErrors.password : undefined

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row fade-in">
      {/* Brand panel */}
      <div
        className="relative flex flex-col items-center justify-center pt-14 pb-20 px-4 md:pb-14 md:w-[45%] lg:w-[50%] md:min-h-screen md:sticky md:top-0"
        style={{ background: 'linear-gradient(140deg, #042f2e 0%, #0f766e 52%, #0d9488 120%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-brand text-2xl font-bold text-white tracking-tight leading-tight">HomeCare</span>
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase -mt-0.5">Partner Portal</span>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">Manage your jobs, earnings &amp; schedule</p>

        <div className="hidden md:flex flex-col gap-4 mt-8 max-w-xs">
          {[
            { text: 'Set your own schedule and work hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: 'Get paid weekly with transparent earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: 'Join 2,000+ service professionals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <p className="text-white/70 text-sm leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 pb-10 md:mt-0 md:pb-0 md:px-8 lg:px-16">
        <div className="w-full max-w-md glass-card overflow-hidden md:shadow-none md:border-0 md:bg-transparent">
          <div className="p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-brand text-xl font-bold text-primary">Sign in to your account</h2>
              <p className="text-muted text-sm mt-1">Access your partner dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {serverError && (
                <div className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10" role="alert">
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="partner-email" className="text-xs font-semibold text-secondary">Email address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    ref={emailRef}
                    id="partner-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    className={`input-base w-full pl-9 pr-4 py-3 text-sm ${emailError ? 'field-invalid' : ''}`}
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'partner-email-error' : undefined}
                  />
                </div>
                {emailError && (
                  <p id="partner-email-error" className="text-xs text-error fade-in">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="partner-password" className="text-xs font-semibold text-secondary">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    ref={passwordRef}
                    id="partner-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Your password"
                    className={`input-base w-full pl-9 pr-10 py-3 text-sm ${passwordError ? 'field-invalid' : ''}`}
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'partner-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
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
                {passwordError && (
                  <p id="partner-password-error" className="text-xs text-error fade-in">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-base w-full py-3 text-sm font-semibold text-white mt-1 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Use your registered partner credentials
        </p>
      </div>
    </div>
  )
}
