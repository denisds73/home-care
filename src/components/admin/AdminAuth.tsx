import { useState } from 'react'
import useStore from '../../store/useStore'
import Modal from '../common/Modal'

export default function AdminAuth() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const adminAuthOpen = useStore(s => s.adminAuthOpen)
  const { unlockAdmin, setView, showToast } = useStore()

  const verify = () => {
    if (pin === '1234') {
      unlockAdmin()
      useStore.setState({ adminAuthOpen: false })
      setPin('')
      setError(false)
      setView('admin')
      showToast('Admin access granted', 'success')
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <Modal isOpen={adminAuthOpen} onClose={() => useStore.setState({ adminAuthOpen: false })} maxWidth="max-w-xs">
      <div className="p-6 text-center">
        <svg className="w-10 h-10 mx-auto mb-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <h3 className="text-lg font-bold mb-1 text-primary">Admin Access</h3>
        <p className="text-muted text-xs mb-4">Enter PIN to access the admin panel</p>
        <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value); setError(false) }}
          onKeyDown={e => { if (e.key === 'Enter') verify() }}
          className="input-base w-full px-4 py-3 text-center text-lg font-bold tracking-[.3em] mb-2"
          placeholder="Enter 4-digit PIN" autoFocus />
        <p className="text-xs text-muted mb-4">Demo PIN: <strong>1234</strong></p>
        {error && <p className="text-error text-xs mb-3">Incorrect PIN</p>}
        <button onClick={verify} className="btn-base btn-primary text-white w-full py-3 rounded-xl font-semibold text-sm">Unlock Admin</button>
        <button onClick={() => useStore.setState({ adminAuthOpen: false })} className="btn-base btn-secondary w-full py-2 text-xs mt-2">Cancel</button>
      </div>
    </Modal>
  )
}
