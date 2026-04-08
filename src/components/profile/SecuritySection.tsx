import { memo, useState, type ReactNode } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { ChangePasswordModal } from './ChangePasswordModal'
import { DeleteAccountModal } from './DeleteAccountModal'

export const SecuritySection = memo(() => {
  const logout = useAuthStore((s) => s.logout)
  const showToast = useStore((s) => s.showToast)

  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleLogoutAll = () => {
    logout()
    showToast('Logged out of all devices', 'success')
  }

  return (
    <section className="fade-in" aria-labelledby="security-heading">
      <div className="glass-card no-hover p-5 md:p-6">
        <div className="mb-5">
          <h2
            id="security-heading"
            className="font-brand text-lg font-semibold text-primary"
          >
            Security
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Protect your account and personal data.
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          <ActionRow
            title="Change password"
            description="Update your account password"
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
            onClick={() => setPwOpen(true)}
          />
          <ActionRow
            title="Log out of all devices"
            description="Sign out everywhere you're currently logged in"
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
            }
            onClick={handleLogoutAll}
          />
          <ActionRow
            title="Delete account"
            description="Permanently remove your account and data"
            danger
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" />
              </svg>
            }
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </div>

      <ChangePasswordModal isOpen={pwOpen} onClose={() => setPwOpen(false)} />
      <DeleteAccountModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </section>
  )
})

SecuritySection.displayName = 'SecuritySection'

interface ActionRowProps {
  title: string
  description: string
  icon: ReactNode
  danger?: boolean
  onClick: () => void
}

const ActionRow = memo(
  ({ title, description, icon, danger, onClick }: ActionRowProps) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 py-4 text-left min-h-[64px] hover:bg-muted/60 rounded-lg px-2 -mx-2 transition-colors"
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: danger ? 'var(--color-error-soft)' : 'var(--color-primary-soft)',
          color: danger ? 'var(--color-error)' : 'var(--color-primary)',
        }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-semibold ${
            danger ? 'text-error' : 'text-primary'
          }`}
        >
          {title}
        </span>
        <span className="block text-xs text-muted mt-0.5">{description}</span>
      </span>
      <svg
        className="w-5 h-5 text-muted shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  ),
)

ActionRow.displayName = 'ActionRow'
