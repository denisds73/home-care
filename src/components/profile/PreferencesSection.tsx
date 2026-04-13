import { memo, useEffect, useRef, useState } from 'react'
import type { NotificationPrefs, User, UserPreferences } from '../../types/domain'
import Dropdown from '../common/Dropdown'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

interface PreferencesSectionProps {
  user: User
}

const DEFAULT_PREFS: UserPreferences = {
  notifications: { email: true, sms: true, push: true, marketing: false },
  language: 'en',
}

export const PreferencesSection = memo(({ user }: PreferencesSectionProps) => {
  const updateUser = useAuthStore((s) => s.updateUser)
  const showToast = useStore((s) => s.showToast)

  const [prefs, setPrefs] = useState<UserPreferences>(
    () => user.preferences ?? DEFAULT_PREFS,
  )

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      updateUser({ preferences: prefs })
      try {
        await userService.updatePreferences(prefs)
        showToast('Preferences saved', 'success')
      } catch {
        showToast('Preferences saved locally', 'warning')
      }
    }, 500)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [prefs, updateUser, showToast])

  const toggleNotif = (key: keyof NotificationPrefs) => {
    setPrefs((p) => ({
      ...p,
      notifications: { ...p.notifications, [key]: !p.notifications[key] },
    }))
  }

  return (
    <section className="fade-in" aria-labelledby="preferences-heading">
      <div className="glass-card no-hover p-5 md:p-6">
        <div className="mb-5">
          <h2
            id="preferences-heading"
            className="font-brand text-lg font-semibold text-primary"
          >
            Preferences
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Control how we reach out and which language you prefer.
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          <ToggleRow
            title="Email notifications"
            description="Booking confirmations and receipts"
            checked={prefs.notifications.email}
            onChange={() => toggleNotif('email')}
          />
          <ToggleRow
            title="SMS notifications"
            description="Service technician updates on arrival"
            checked={prefs.notifications.sms}
            onChange={() => toggleNotif('sms')}
          />
          <ToggleRow
            title="Push notifications"
            description="Real-time alerts on your device"
            checked={prefs.notifications.push}
            onChange={() => toggleNotif('push')}
          />
          <ToggleRow
            title="Marketing emails"
            description="Offers, promos, and new service launches"
            checked={prefs.notifications.marketing}
            onChange={() => toggleNotif('marketing')}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-default">
          <Dropdown
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी (Hindi)' },
            ]}
            value={prefs.language}
            onChange={(v) =>
              setPrefs((p) => ({
                ...p,
                language: v as UserPreferences['language'],
              }))
            }
            label="Language"
            id="pref-language"
            className="w-full md:w-64"
          />
        </div>
      </div>
    </section>
  )
})

PreferencesSection.displayName = 'PreferencesSection'

interface ToggleRowProps {
  title: string
  description: string
  checked: boolean
  onChange: () => void
}

const ToggleRow = memo(
  ({ title, description, checked, onChange }: ToggleRowProps) => (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className="relative inline-flex items-center rounded-full transition-all shrink-0"
        style={{
          width: 48,
          height: 28,
          background: checked
            ? 'var(--color-primary)'
            : 'var(--color-border)',
        }}
      >
        <span
          className="absolute rounded-full shadow-sm transition-transform"
          style={{
            width: 22,
            height: 22,
            top: 3,
            left: 3,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            background: 'var(--color-card)',
          }}
        />
      </button>
    </div>
  ),
)

ToggleRow.displayName = 'ToggleRow'
