import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { loginSchema, DASHBOARD_ROUTES } from '../../lib/auth'
import type { LoginFormData } from '../../lib/auth'

export default function AdminLoginPage() {
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

  // Redirect only when already authenticated as admin.
  // Keep the form accessible for role switching (e.g. vendor -> admin).
  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      navigate(returnTo ?? DASHBOARD_ROUTES[role] ?? '/admin', {
        replace: true,
      })
    }
  }, [isAuthenticated, role, navigate, returnTo])

  // Clear server error on mount
  useEffect(() => {
    clearError()
  }, [clearError])

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

  const fillDemo = () => {
    setForm({ email: 'demo@admin.com', password: 'demo123' })
    setTouched({ email: true, password: true })
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

    try {
      await login(form.email, form.password, 'admin')
      const dest = returnTo ?? DASHBOARD_ROUTES['admin'] ?? '/admin'
      navigate(dest, { replace: true })
    } catch {
      // Error is already set in the auth store and rendered via serverError
    }
  }

  const emailError = touched.email ? fieldErrors.email : undefined
  const passwordError = touched.password ? fieldErrors.password : undefined

  return (
    <div className="theme-admin min-h-dvh max-md:h-dvh max-md:max-h-dvh max-md:overflow-hidden overflow-x-hidden bg-surface flex flex-col md:min-h-screen md:h-auto md:max-h-none md:overflow-visible md:flex-row fade-in">
      {/* Brand panel */}
      <div
        className="relative shrink-0 flex flex-col items-center justify-center pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 max-md:ps-[max(1rem,env(safe-area-inset-left))] max-md:pe-[max(1rem,env(safe-area-inset-right))] md:px-4 md:pt-14 md:pb-14 md:w-[45%] lg:w-[50%] md:min-h-screen md:sticky md:top-0"
        style={{
          background:
            'linear-gradient(140deg, #1e1b4b 0%, #3730a3 52%, #4338ca 120%)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg
            className="w-9 h-9"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#a5b4fc"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
            />
          </svg>
          <span className="text-xl font-extrabold font-brand text-white">
            HomeCare{' '}
            <span className="text-sm font-normal opacity-70">Admin</span>
          </span>
        </div>
        <p className="text-white/60 text-sm mb-4 md:mb-6">Platform Administration</p>

        <div className="hidden md:flex flex-col gap-4 mt-8 max-w-xs">
          {[
            {
              text: 'Full operational control over bookings and services',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            },
            {
              text: 'Real-time dashboard with revenue analytics',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              text: 'Vendor management and approval workflows',
              icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              <p className="text-white/70 text-sm leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 min-h-0 flex flex-col max-md:items-stretch md:items-center max-md:overflow-y-auto max-md:overscroll-y-contain max-md:justify-center md:justify-center max-md:py-4 max-md:ps-[max(1rem,env(safe-area-inset-left))] max-md:pe-[max(1rem,env(safe-area-inset-right))] md:px-8 lg:px-16 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0 md:py-0 md:overflow-visible">
        <div className="w-full max-w-md max-md:relative max-md:z-10 max-md:-translate-y-6">
          <div className="glass-card no-hover w-full overflow-hidden p-6 max-md:rounded-2xl max-md:shadow-[0_-6px_28px_rgba(0,0,0,0.14)] md:p-7 md:shadow-none md:border-0 md:bg-transparent">
            <h2 className="text-lg font-bold text-primary mb-1">Admin Login</h2>
            <p className="text-xs text-muted mb-5">Authorized personnel only</p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
              noValidate
            >
              {serverError && (
                <div
                  className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="admin-email"
                  className="text-xs font-semibold text-secondary"
                >
                  Email address
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    ref={emailRef}
                    id="admin-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="Admin email"
                    className={`input-base w-full py-3 pl-9 pr-4 text-sm ${emailError ? 'field-invalid' : ''}`}
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={
                      emailError ? 'admin-email-error' : undefined
                    }
                  />
                </div>
                {emailError && (
                  <p
                    id="admin-email-error"
                    className="text-xs text-error fade-in"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-semibold text-secondary"
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    ref={passwordRef}
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Your password"
                    className={`input-base w-full py-3 pl-9 pr-10 text-sm ${passwordError ? 'field-invalid' : ''}`}
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                    aria-describedby={
                      passwordError ? 'admin-password-error' : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p
                    id="admin-password-error"
                    className="text-xs text-error fade-in"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-base btn-primary w-full py-3 font-bold text-sm mt-1 disabled:opacity-60"
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Unlock Admin'}
              </button>
            </form>

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={fillDemo}
                className="w-full mt-4 text-xs text-brand font-medium py-2 px-3 rounded-lg border border-dashed border-brand/30 hover:bg-[var(--color-primary-soft)] transition-colors min-h-[44px]"
              >
                Fill demo credentials
              </button>
            )}

            <p className="text-center text-xs text-muted mt-4">
              Use your admin credentials to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
