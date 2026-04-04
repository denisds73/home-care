import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

export default function ProfilePage() {
  const user = useAuthStore(state => state.user)
  const showToast = useStore(state => state.showToast)

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

        {/* Profile details (read-only) */}
        {/* TODO: Wire to user self-update endpoint when backend supports PATCH /users/me */}
        <section className="glass-card p-5 md:p-6 mb-6">
          <h2 className="font-brand text-base font-semibold text-primary mb-4">Personal Details</h2>
          <div className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-sm font-medium text-secondary">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={user?.name ?? ''}
                readOnly
                className="input-base px-3 py-2.5 text-sm w-full opacity-60 cursor-not-allowed"
                aria-label="Full name (read-only)"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-secondary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="input-base px-3 py-2.5 text-sm w-full opacity-60 cursor-not-allowed"
                aria-label="Email address (read-only)"
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
                value={user?.phone ?? ''}
                readOnly
                className="input-base px-3 py-2.5 text-sm w-full opacity-60 cursor-not-allowed"
                aria-label="Phone number (read-only)"
              />
            </div>

            <p className="text-xs text-muted">
              Profile editing will be available soon. Contact support to update your details.
            </p>
          </div>
        </section>

        {/* Saved Addresses — no backend endpoint yet */}
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

          {/* TODO: Wire to address CRUD endpoints when backend supports them */}
          <div className="flex flex-col items-center justify-center py-10 text-center fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-muted mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3 className="font-brand text-sm font-semibold text-primary">No saved addresses</h3>
            <p className="text-muted text-xs mt-1">Your saved addresses will appear here.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
