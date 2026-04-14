import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCustomerNotifications } from '../../hooks/useCustomerNotifications'

export default function DelayAlertBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { highPriorityItems } = useCustomerNotifications()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [exiting, setExiting] = useState(false)

  const visible = isAuthenticated
    ? highPriorityItems.filter((n) => !dismissed.has(n.id))
    : []

  const latest = visible[0] ?? null

  const dismiss = useCallback(() => {
    if (!latest) return
    setExiting(true)
    setTimeout(() => {
      setDismissed((s) => new Set(s).add(latest.id))
      setExiting(false)
    }, 280)
  }, [latest])

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!latest) return
    const timer = setTimeout(dismiss, 15000)
    return () => clearTimeout(timer)
  }, [latest, dismiss])

  if (!latest) return null

  const isCannotAttend = latest.title.toLowerCase().includes('cannot')

  return (
    <div
      className="fixed left-0 right-0 z-[52] flex justify-center px-4 pointer-events-none"
      style={{ top: 'max(72px, env(safe-area-inset-top, 0px) + 72px)' }}
    >
      <div
        className="pointer-events-auto w-full max-w-lg"
        style={{
          animation: exiting
            ? 'toastSlideOut 0.28s cubic-bezier(0.55, 0, 1, 0.45) forwards'
            : 'toastSlideIn 0.36s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px) saturate(140%)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            border: `1px solid ${isCannotAttend ? 'rgba(220, 38, 38, 0.12)' : 'rgba(217, 119, 6, 0.12)'}`,
            borderRadius: '14px',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.10),
              0 2px 8px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
          }}
        >
          {/* Accent top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: isCannotAttend
                ? 'linear-gradient(90deg, #DC2626, rgba(220, 38, 38, 0.4), transparent)'
                : 'linear-gradient(90deg, #D97706, rgba(217, 119, 6, 0.4), transparent)',
            }}
          />

          <button
            type="button"
            className="w-full text-left flex items-start gap-3 px-4 py-3"
            onClick={() => {
              if (latest.booking_id) navigate(`/app/bookings/${latest.booking_id}`)
              else navigate('/app/notifications')
            }}
          >
            {/* Icon */}
            <div
              className="relative flex items-center justify-center shrink-0"
              style={{ width: 28, height: 28 }}
            >
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: isCannotAttend ? '#DC2626' : '#D97706' }}
              />
              <svg
                className="w-3.5 h-3.5 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke={isCannotAttend ? '#DC2626' : '#D97706'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isCannotAttend ? (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </>
                )}
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold leading-snug text-primary">
                {latest.title}
              </p>
              <p className="text-[12px] text-secondary mt-0.5 line-clamp-1">
                {latest.description}
              </p>
            </div>

            {/* Arrow CTA */}
            <span className="shrink-0 self-center w-6 h-6 rounded-full flex items-center justify-center bg-muted">
              <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
