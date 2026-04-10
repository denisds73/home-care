import { useState, useRef, useCallback } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import {
  DASHBOARD_ROUTES,
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from '../../lib/auth'
import { otpService } from '../../services/otpService'
import { ResendTimer } from '../../components/booking/ResendTimer'

type Tab = 'login' | 'signup'

/* ── Validation helpers ── */

interface SchemaLike {
  safeParse: (data: unknown) => {
    success: boolean
    error?: { issues: Array<{ path: PropertyKey[]; message: string }> }
  }
}

function validateField<T extends Record<string, unknown>>(
  schema: SchemaLike,
  data: T,
  field: string
): string | null {
  const result = schema.safeParse(data)
  if (result.success) return null
  const issue = result.error?.issues.find((i) => String(i.path[0]) === field)
  return issue?.message ?? null
}

function validateForm<T extends Record<string, unknown>>(
  schema: SchemaLike,
  data: T
): Record<string, string> {
  const result = schema.safeParse(data)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error?.issues ?? []) {
    const key = String(issue.path[0])
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

/* ── Inline SVG icons ── */

const EmailIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LockIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const UserIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const PhoneIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

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

const Spinner = (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)
  const login = useAuthStore((s) => s.login)
  const signup = useAuthStore((s) => s.signup)
  const showToast = useStore((s) => s.showToast)

  // Keep customer login available for cross-role account switching.
  // Auto-redirect only when the active session is already a customer.
  if (isAuthenticated && role === 'customer') {
    return <Navigate to={DASHBOARD_ROUTES[role] ?? '/app'} replace />
  }

  const [tab, setTab] = useState<Tab>('login')

  // Login form
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' })
  const [showLoginPw, setShowLoginPw] = useState(false)

  // Signup form
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [showSignupPw, setShowSignupPw] = useState(false)
  const [showSignupConfirmPw, setShowSignupConfirmPw] = useState(false)

  // Phone OTP verification state
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  // Shared state
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const switchTab = useCallback((next: Tab) => {
    setTab(next)
    setTouched({})
    setFieldErrors({})
    setServerError('')
    setOtpSent(false)
    setOtpValue('')
    setPhoneVerified(false)
    setOtpError('')
  }, [])

  /* ── Login handlers ── */

  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    const next = { ...loginData, [field]: value }
    setLoginData(next)
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy })
    }
  }

  const handleLoginBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateField(loginSchema, loginData, field)
    setFieldErrors((prev) => err ? { ...prev, [field]: err } : (() => { const c = { ...prev }; delete c[field]; return c })())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    const allTouched: Record<string, boolean> = { email: true, password: true }
    setTouched(allTouched)
    const errors = validateForm(loginSchema, loginData)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0]
      const el = formRef.current?.querySelector<HTMLInputElement>(`#login-${firstKey}`)
      el?.focus()
      return
    }
    setIsSubmitting(true)
    try {
      await login(loginData.email, loginData.password)
      showToast('Welcome back!', 'success')
      const userRole = useAuthStore.getState().role
      navigate(returnTo || DASHBOARD_ROUTES[userRole ?? 'customer'] || '/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Signup handlers ── */

  const handleSignupChange = (field: keyof SignupFormData, value: string) => {
    const next = { ...signupData, [field]: value }
    setSignupData(next)
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const copy = { ...prev }; delete copy[field]; return copy })
    }
    if (field === 'phone') {
      setPhoneVerified(false)
      setOtpSent(false)
      setOtpValue('')
      setOtpError('')
    }
  }

  const handleSignupBlur = (field: keyof SignupFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateField(signupSchema, signupData, field)
    setFieldErrors((prev) => err ? { ...prev, [field]: err } : (() => { const c = { ...prev }; delete c[field]; return c })())
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    const allTouched: Record<string, boolean> = {
      name: true, email: true, phone: true, password: true, confirmPassword: true,
    }
    setTouched(allTouched)
    const errors = validateForm(signupSchema, signupData)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0]
      const el = formRef.current?.querySelector<HTMLInputElement>(`#signup-${firstKey}`)
      el?.focus()
      return
    }
    if (!phoneVerified) {
      setFieldErrors(prev => ({ ...prev, phone: 'Please verify your phone number' }))
      return
    }
    setIsSubmitting(true)
    try {
      await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
      })
      showToast('Account created!', 'success')
      navigate('/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Phone OTP helpers ── */

  const isPhoneValid = /^[6-9]\d{9}$/.test(signupData.phone)

  const handleSendOtp = async () => {
    if (!isPhoneValid) return
    setOtpLoading(true)
    setOtpError('')
    try {
      await otpService.sendOtp(signupData.phone)
      setOtpSent(true)
      showToast('OTP sent to your phone', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setOtpError(message)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return
    setOtpLoading(true)
    setOtpError('')
    try {
      await otpService.verifyOtp(signupData.phone, otpValue)
      setPhoneVerified(true)
      setOtpSent(false)
      showToast('Phone verified!', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid OTP'
      setOtpError(message)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpError('')
    try {
      await otpService.sendOtp(signupData.phone)
      showToast('OTP resent', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend'
      setOtpError(message)
    }
  }

  /* ── Shared field helpers ── */

  const fieldCls = (field: string) =>
    `input-base w-full pl-9 pr-4 py-3 text-sm${touched[field] && fieldErrors[field] ? ' field-invalid' : ''}`

  const fieldClsPw = (field: string) =>
    `input-base w-full pl-9 pr-10 py-3 text-sm${touched[field] && fieldErrors[field] ? ' field-invalid' : ''}`

  const FieldError = ({ field }: { field: string }) => {
    if (!touched[field] || !fieldErrors[field]) return null
    return (
      <span id={`${tab}-${field}-error`} className="text-xs text-error fade-in" role="alert">
        {fieldErrors[field]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row fade-in">
      {/* Brand panel — stacked on mobile, left column on desktop */}
      <div
        className="relative flex flex-col items-center justify-center pt-10 pb-14 px-4 md:pt-14 md:pb-14 md:w-[45%] lg:w-[50%] md:min-h-screen md:sticky md:top-0"
        style={{ background: 'linear-gradient(140deg, #0B1220 0%, #4C1D95 52%, #6D28D9 120%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="font-brand text-2xl font-bold text-white tracking-tight">HomeCare</span>
        </div>
        <p className="text-white/70 text-sm mb-6">Your home, expertly cared for</p>

        {/* Trust signals — desktop only */}
        <div className="hidden md:flex flex-col gap-4 mt-8 max-w-xs">
          {[
            { text: 'Verified professionals with background checks', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: '30-day service guarantee on all bookings', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
            { text: 'Trusted by 50,000+ homeowners across India', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
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

      {/* Form panel — overlapping card on mobile, right column on desktop */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8 pb-8 md:mt-0 md:pb-0 md:px-8 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Desktop heading — hidden on mobile where the gradient header serves this role */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold font-brand text-primary">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {tab === 'login' ? 'Sign in to manage your home services' : 'Join thousands of homeowners on HomeCare'}
            </p>
          </div>

          <div className="glass-card no-hover overflow-hidden md:rounded-2xl md:shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:border md:border-border-default">
          {/* Tabs */}
          <div className="flex border-b border-default">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                className={`flex-1 py-3.5 text-[.8rem] font-semibold transition-colors ${
                  tab === t
                    ? 'text-brand border-b-2 border-brand bg-brand-soft/20'
                    : 'text-muted hover:text-secondary'
                }`}
                onClick={() => switchTab(t)}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6">
            {tab === 'login' ? (
              <form ref={formRef} onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
                {serverError && (
                  <div className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10" role="alert" aria-live="polite">
                    {serverError}
                  </div>
                )}

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-email" className="text-xs font-semibold text-secondary">Email address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{EmailIcon}</span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => handleLoginChange('email', e.target.value)}
                      onBlur={() => handleLoginBlur('email')}
                      placeholder="you@example.com"
                      className={fieldCls('email')}
                      autoComplete="email"
                      aria-invalid={touched.email && !!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                    />
                  </div>
                  <FieldError field="email" />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-password" className="text-xs font-semibold text-secondary">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{LockIcon}</span>
                    <input
                      id="login-password"
                      type={showLoginPw ? 'text' : 'password'}
                      required
                      value={loginData.password}
                      onChange={(e) => handleLoginChange('password', e.target.value)}
                      onBlur={() => handleLoginBlur('password')}
                      placeholder="Your password"
                      className={fieldClsPw('password')}
                      autoComplete="current-password"
                      aria-invalid={touched.password && !!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                      aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPw ? EyeOffIcon : EyeIcon}
                    </button>
                  </div>
                  <FieldError field="password" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-base btn-primary w-full py-3 text-sm mt-1 disabled:opacity-60 gap-2"
                >
                  {isSubmitting && Spinner}
                  {isSubmitting ? 'Signing in...' : 'Log In'}
                </button>
              </form>
            ) : (
              <form ref={formRef} onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
                {serverError && (
                  <div className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10" role="alert" aria-live="polite">
                    {serverError}
                  </div>
                )}

                {/* Full name */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-name" className="text-xs font-semibold text-secondary">Full name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{UserIcon}</span>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={signupData.name}
                      onChange={(e) => handleSignupChange('name', e.target.value)}
                      onBlur={() => handleSignupBlur('name')}
                      placeholder="Jane Smith"
                      className={fieldCls('name')}
                      autoComplete="name"
                      aria-invalid={touched.name && !!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
                    />
                  </div>
                  <FieldError field="name" />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-email" className="text-xs font-semibold text-secondary">Email address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{EmailIcon}</span>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => handleSignupChange('email', e.target.value)}
                      onBlur={() => handleSignupBlur('email')}
                      placeholder="you@example.com"
                      className={fieldCls('email')}
                      autoComplete="email"
                      aria-invalid={touched.email && !!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                    />
                  </div>
                  <FieldError field="email" />
                </div>

                {/* Phone with inline OTP verification */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-phone" className="text-xs font-semibold text-secondary">
                    Phone number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{PhoneIcon}</span>
                    <input
                      id="signup-phone"
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      value={signupData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '')
                        handleSignupChange('phone', digits)
                      }}
                      onBlur={() => handleSignupBlur('phone')}
                      placeholder="10-digit mobile number"
                      className={`input-base w-full pl-9 ${phoneVerified ? 'pr-10' : isPhoneValid && !phoneVerified ? 'pr-20' : 'pr-4'} py-3 text-sm${touched.phone && fieldErrors.phone ? ' field-invalid' : phoneVerified ? ' field-valid' : ''}`}
                      autoComplete="tel"
                      disabled={phoneVerified}
                      aria-invalid={touched.phone && !!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'signup-phone-error' : undefined}
                    />
                    {/* Verified badge */}
                    {phoneVerified && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success fade-in" title="Phone verified">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    )}
                    {/* Verify button — shown when phone is valid but not yet verified or OTP sent */}
                    {isPhoneValid && !phoneVerified && !otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[.7rem] font-semibold text-brand hover:text-brand-dark transition-colors disabled:opacity-50 bg-brand-soft px-2.5 py-1 rounded-lg fade-in"
                      >
                        {otpLoading ? 'Sending...' : 'Verify'}
                      </button>
                    )}
                  </div>
                  <FieldError field="phone" />
                  {/* Change number link when verified */}
                  {phoneVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneVerified(false)
                        setOtpSent(false)
                        setOtpValue('')
                        setOtpError('')
                      }}
                      className="text-xs text-brand font-medium hover:underline mt-0.5 self-start"
                    >
                      Change number
                    </button>
                  )}

                  {/* Inline OTP input — shown after OTP is sent */}
                  {otpSent && !phoneVerified && (
                    <div className="mt-2 p-3 bg-muted rounded-xl border border-default fade-in">
                      <p className="text-xs text-secondary mb-2">
                        Enter the 6-digit code sent to <span className="font-semibold text-primary">{signupData.phone}</span>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpValue}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '')
                            setOtpValue(digits)
                            setOtpError('')
                          }}
                          placeholder="000000"
                          className={`input-base flex-1 px-3 py-2.5 text-sm text-center tracking-[.3em] font-mono font-bold${otpError ? ' field-invalid' : ''}`}
                          autoFocus
                          aria-label="OTP code"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpValue.length !== 6 || otpLoading}
                          className="btn-base btn-primary px-4 py-2.5 text-sm font-semibold disabled:opacity-50 shrink-0"
                        >
                          {otpLoading ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : 'Confirm'}
                        </button>
                      </div>
                      {otpError && <p className="text-xs text-error mt-1.5 fade-in">{otpError}</p>}
                      <ResendTimer onResend={handleResendOtp} durationSeconds={30} maxResends={3} />
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-password" className="text-xs font-semibold text-secondary">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{LockIcon}</span>
                    <input
                      id="signup-password"
                      type={showSignupPw ? 'text' : 'password'}
                      required
                      value={signupData.password}
                      onChange={(e) => handleSignupChange('password', e.target.value)}
                      onBlur={() => handleSignupBlur('password')}
                      placeholder="Min. 6 characters"
                      className={fieldClsPw('password')}
                      autoComplete="new-password"
                      aria-invalid={touched.password && !!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                      aria-label={showSignupPw ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPw ? EyeOffIcon : EyeIcon}
                    </button>
                  </div>
                  <FieldError field="password" />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-confirmPassword" className="text-xs font-semibold text-secondary">Confirm password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">{LockIcon}</span>
                    <input
                      id="signup-confirmPassword"
                      type={showSignupConfirmPw ? 'text' : 'password'}
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => handleSignupChange('confirmPassword', e.target.value)}
                      onBlur={() => handleSignupBlur('confirmPassword')}
                      placeholder="Re-enter password"
                      className={fieldClsPw('confirmPassword')}
                      autoComplete="new-password"
                      aria-invalid={touched.confirmPassword && !!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'signup-confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                      aria-label={showSignupConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showSignupConfirmPw ? EyeOffIcon : EyeIcon}
                    </button>
                  </div>
                  <FieldError field="confirmPassword" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-base btn-primary w-full py-3 text-sm mt-1 disabled:opacity-60 gap-2"
                >
                  {isSubmitting && Spinner}
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-muted">
              {tab === 'login' ? 'Use your registered email and password' : 'By signing up you agree to our terms of service'}
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
