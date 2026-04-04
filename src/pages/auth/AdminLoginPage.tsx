import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const login = useAuthStore(s => s.login)
  const showToast = useStore(s => s.showToast)
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (pin !== '1234') {
      setError(true)
      setPin('')
      return
    }
    login(email || 'admin@homecare.com', 'admin')
    showToast('Admin access granted', 'success')
    navigate('/admin')
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

          <div className="space-y-3">
            <input
              type="email"
              className="input-base w-full py-3 px-4 text-sm"
              placeholder="Admin email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="input-base w-full py-3 px-4 text-sm text-center tracking-[.3em] font-bold"
              placeholder="4-digit PIN"
              value={pin}
              onChange={e => {
                setPin(e.target.value)
                setError(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
            {error && <p className="text-error text-xs text-center">Incorrect PIN</p>}
            <p className="text-xs text-muted text-center">
              Demo PIN: <strong>1234</strong>
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 font-bold text-sm text-white rounded-xl transition"
              style={{ background: '#4338ca' }}
            >
              Unlock Admin
            </button>
          </div>
          <p className="text-center text-xs text-muted mt-5">Demo: any email + PIN 1234</p>
        </div>
      </div>
    </div>
  )
}
