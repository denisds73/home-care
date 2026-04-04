import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const login = useAuthStore(s => s.login)
  const showToast = useStore(s => s.showToast)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    try {
      await login(email, password, 'admin')
      showToast('Admin access granted', 'success')
      navigate('/admin')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(140deg, #1e1b4b 0%, #3730a3 52%, #4338ca 120%)' }}
        >
          <div className="text-white text-center py-10 px-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
                />
              </svg>
              <span className="text-xl font-extrabold font-brand">
                HomeCare <span className="text-sm font-normal opacity-70">Admin</span>
              </span>
            </div>
            <p className="text-sm opacity-70">Platform Administration</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg -mt-6 relative z-10 p-7">
          <h2 className="text-lg font-bold text-primary mb-1">Admin Login</h2>
          <p className="text-xs text-muted mb-5">Authorized personnel only</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && (
              <div className="text-xs text-error fade-in text-center py-2 px-3 rounded-lg bg-error/10">
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="admin-email" className="text-xs font-semibold text-secondary">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                className="input-base w-full py-3 px-4 text-sm"
                placeholder="Admin email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="admin-password" className="text-xs font-semibold text-secondary">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="input-base w-full py-3 px-4 text-sm"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 font-bold text-sm text-white rounded-xl transition disabled:opacity-60"
              style={{ background: '#4338ca' }}
            >
              {isSubmitting ? 'Signing in...' : 'Unlock Admin'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-5">
            Use your admin credentials to sign in
          </p>
        </div>
      </div>
    </div>
  )
}
