import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { loginSchema, DASHBOARD_ROUTES } from '../../lib/auth'
import type { LoginFormData } from '../../lib/auth'

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
    if (isAuthenticated && role) {
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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 fade-in">
      <div className="w-full max-w-md glass-card overflow-hidden">
        <div
          className="px-6 py-8 text-white"
          style={{
            background:
              'linear-gradient(140deg, #042f2e 0%, #0f766e 52%, #0d9488 120%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg
                className="w-6 h-6"
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
            <div>
              <p className="font-brand text-xl font-bold leading-tight">
                HomeCare
              </p>
              <p className="text-[11px] uppercase tracking-widest text-white/70">
                Technician
              </p>
            </div>
          </div>
          <p className="text-white/70 text-sm mt-3">Sign in to start your day</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4" noValidate>
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
              Email
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
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
  )
}
