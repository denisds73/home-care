import { useState } from 'react'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'

interface LoginScreenProps {
  onAuthSuccess?: () => void
  onClose?: () => void
}

export default function LoginScreen({ onAuthSuccess, onClose }: LoginScreenProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const login = useAuthStore(s => s.login)
  const showToast = useStore(s => s.showToast)

  const handleSubmit = () => {
    login(email || 'user@demo.com', 'password', 'customer')
    showToast('Welcome to HomeCare!', 'success')
    onAuthSuccess?.()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[120] w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-gray-200 text-secondary hover:text-primary hover:bg-white transition"
          aria-label="Close login screen"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      )}
      <div className="text-white text-center py-12 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(140deg, #0B1220 0%, #4C1D95 52%, #6D28D9 120%)' }}>
        <div className="absolute -right-15 -top-15 w-50 h-50 rounded-full" style={{ background: 'rgba(109,40,217,.16)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#FEF3C7" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
            <span className="text-2xl font-extrabold font-brand">Home<span style={{ color: 'var(--color-accent-soft)' }}>Care</span></span>
          </div>
          <p className="text-base opacity-80 mb-1">Home Appliance Services</p>
          <p className="text-xs opacity-50">AC · TV · Fridge · Microwave · Purifier · Washing Machine</p>
        </div>
      </div>

      <div className="flex-1 -mt-8 relative z-10 px-5 pb-10">
        <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-7">
          <div className="flex gap-6 mb-6 border-b border-gray-100">
            <button className={`pb-2 text-sm font-semibold border-b-2 transition ${tab === 'login' ? 'text-brand border-brand' : 'text-muted border-transparent'}`} onClick={() => setTab('login')}>Log In</button>
            <button className={`pb-2 text-sm font-semibold border-b-2 transition ${tab === 'signup' ? 'text-brand border-brand' : 'text-muted border-transparent'}`} onClick={() => setTab('signup')}>Sign Up</button>
          </div>

          {tab === 'login' ? (
            <div className="space-y-3">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" className="input-base w-full py-3 pl-11 pr-4 text-sm" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type="password" className="input-base w-full py-3 pl-11 pr-4 text-sm" placeholder="Password" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer"><input type="checkbox" className="accent-orange-500" defaultChecked /> Remember me</label>
                <button type="button" className="text-xs font-semibold text-brand">Forgot password?</button>
              </div>
              <button onClick={handleSubmit} className="btn-base btn-primary w-full py-3 font-bold text-sm mt-2">Log In</button>
              <div className="flex items-center gap-3 my-4 text-muted text-xs"><div className="flex-1 h-px bg-gray-200"/><span>or continue with</span><div className="flex-1 h-px bg-gray-200"/></div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleSubmit} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#7C3AED"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button onClick={handleSubmit} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  <svg className="w-4 h-4" fill="#111827" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" className="input-base w-full py-3 px-4 text-sm" placeholder="Full name" />
              <input type="email" className="input-base w-full py-3 px-4 text-sm" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="tel" inputMode="numeric" maxLength={10} className="input-base w-full py-3 px-4 text-sm" placeholder="Phone number" />
              <input type="password" className="input-base w-full py-3 px-4 text-sm" placeholder="Create password" />
              <label className="flex items-start gap-2 text-xs text-secondary cursor-pointer"><input type="checkbox" className="accent-orange-500 mt-0.5" /> I agree to the <span className="font-semibold text-brand">Terms & Conditions</span></label>
              <button onClick={handleSubmit} className="btn-base btn-primary w-full py-3 font-bold text-sm">Create Account</button>
            </div>
          )}
          <p className="text-center text-xs text-muted mt-5">Demo: any email/password works</p>
        </div>
      </div>
    </div>
  )
}
