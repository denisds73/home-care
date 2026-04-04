import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

interface AddressEntry {
  id: string
  label: string
  line1: string
  line2: string
}

const MOCK_ADDRESSES: AddressEntry[] = [
  {
    id: 'addr-1',
    label: 'Home',
    line1: '42, 1st Cross, Koramangala 5th Block',
    line2: 'Bengaluru, Karnataka – 560095',
  },
]

export default function ProfilePage() {
  const user = useAuthStore(state => state.user)
  const showToast = useStore(state => state.showToast)

  const [fullName, setFullName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [nameTouched, setNameTouched] = useState(false)

  const nameInvalid = nameTouched && fullName.trim().length < 2

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 2) {
      setNameTouched(true)
      return
    }
    showToast('Profile updated successfully!', 'success')
  }

  const avatarLetter = (user?.name ?? 'U')[0].toUpperCase()

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">My Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your personal information</p>
        </header>

        {/* Avatar + identity */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-20 h-20 rounded-full bg-brand-soft flex items-center justify-center"
            aria-label={`Avatar for ${user?.name}`}
          >
            <span className="font-brand text-3xl font-bold text-brand">{avatarLetter}</span>
          </div>
          <div className="text-center">
            <p className="font-brand text-lg font-semibold text-primary">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <section className="glass-card p-5 md:p-6 mb-6">
          <h2 className="font-brand text-base font-semibold text-primary mb-4">Personal Details</h2>
          <form onSubmit={handleSave} noValidate>
            <div className="flex flex-col gap-4">
              {/* Full name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fullName" className="text-sm font-medium text-secondary">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  maxLength={80}
                  placeholder="Your full name"
                  className={`input-base px-3 py-2.5 text-sm w-full ${nameInvalid ? 'field-invalid' : ''}`}
                  aria-invalid={nameInvalid}
                  aria-describedby={nameInvalid ? 'nameError' : undefined}
                />
                {nameInvalid && (
                  <span id="nameError" className="text-xs text-error fade-in">
                    Name must be at least 2 characters.
                  </span>
                )}
              </div>

              {/* Email — disabled */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-secondary">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="input-base px-3 py-2.5 text-sm w-full opacity-60 cursor-not-allowed"
                  aria-label="Email address (cannot be changed)"
                />
                <span className="text-xs text-muted">Email cannot be changed.</span>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="text-sm font-medium text-secondary">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={15}
                  placeholder="+91 98765 43210"
                  className="input-base px-3 py-2.5 text-sm w-full"
                />
              </div>

              <button type="submit" className="btn-base btn-primary px-5 py-2.5 text-sm self-start mt-1">
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Saved Addresses */}
        <section className="glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-brand text-base font-semibold text-primary">Saved Addresses</h2>
            <button
              className="btn-base btn-secondary px-3 py-1.5 text-sm"
              onClick={() => showToast('Add address — coming soon.', 'info')}
              aria-label="Add a new address"
            >
              + Add Address
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_ADDRESSES.map(addr => (
              <div key={addr.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-surface border border-default">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{addr.label}</p>
                    <p className="text-xs text-secondary mt-0.5">{addr.line1}</p>
                    <p className="text-xs text-muted">{addr.line2}</p>
                  </div>
                </div>
                <button
                  className="btn-base btn-secondary px-3 py-1.5 text-xs flex-shrink-0"
                  onClick={() => showToast('Edit address — coming soon.', 'info')}
                  aria-label={`Edit ${addr.label} address`}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
