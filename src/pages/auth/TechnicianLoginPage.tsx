import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { loginSchema, DASHBOARD_ROUTES } from '../../lib/auth'
import type { LoginFormData } from '../../lib/auth'

const EyeIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function TechnicianLoginPage() {
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

  useEffect(() => {
    // Allow switching accounts from another active role without forced logout.
    if (isAuthenticated && role === 'technician') {
      navigate(returnTo ?? DASHBOARD_ROUTES[role] ?? '/technician', {
        replace: true,
      })
    }
  }, [isAuthenticated, role, navigate, returnTo])

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

  const handleBlur = (field: keyof LoginFormData) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

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
    await login(form.email, form.password, 'technician')
    navigate(returnTo ?? '/technician', { replace: true })
  }

  const emailError = touched.email ? fieldErrors.email : undefined
  const passwordError = touched.password ? fieldErrors.password : undefined

  return (
    <div className="theme-partner min-h-screen bg-surface flex flex-col md:flex-row fade-in">
      <div
        className="relative flex flex-col items-center justify-center pt-14 pb-20 px-4 md:pb-14 md:w-[45%] lg:w-[50%] md:min-h-screen md:sticky md:top-0"
        style={{
          background:
            'linear-gradient(140deg, #042f2e 0%, #0f766e 52%, #0d9488 120%)',
        }}
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
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766m-3.704 3.796l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-brand text-2xl font-bold text-white tracking-tight leading-tight">
              HomeCare
            </span>
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase -mt-0.5">
              Technician Portal
            </span>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">Sign in to start your field day</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 pb-10 md:mt-0 md:pb-0 md:px-8 lg:px-16">
        <div className="w-full max-w-md glass-card no-hover overflow-hidden md:shadow-none md:border-0 md:bg-transparent">
          <div className="p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-brand text-xl font-bold text-primary">
                Sign in to your technician account
              </h2>
              <p className="text-muted text-sm mt-1">
                Access assigned jobs and updates
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {serverError && (
                <div
                  className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="tech-email" className="text-xs font-semibold text-secondary">
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="tech-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`input-base w-full px-3 py-3 text-sm ${
                    emailError ? 'field-invalid' : ''
                  }`}
                  autoComplete="email"
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="text-xs text-error fade-in">{emailError}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="tech-password" className="text-xs font-semibold text-secondary">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="tech-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Your password"
                    className={`input-base w-full px-3 pr-12 py-3 text-sm ${
                      passwordError ? 'field-invalid' : ''
                    }`}
                    autoComplete="current-password"
                    aria-invalid={!!passwordError}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-error fade-in">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-base btn-primary w-full py-3 text-sm font-semibold mt-1 disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Use your registered technician credentials
        </p>
      </div>
    </div>
  )
}
