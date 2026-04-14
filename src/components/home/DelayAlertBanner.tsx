import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCustomerNotifications } from '../../hooks/useCustomerNotifications'

export default function DelayAlertBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { highPriorityItems } = useCustomerNotifications()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  if (!isAuthenticated) return null

  const visible = highPriorityItems.filter((n) => !dismissed.has(n.id))
  if (visible.length === 0) return null

  const latest = visible[0]

  return (
    <div className="mx-4 mt-3 mb-1 relative glass-card no-hover overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D97706] to-[#D4A017]/50"
        style={{ maskImage: 'linear-gradient(to right, black 70%, transparent)' }}
      />
      <button
        type="button"
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => {
          if (latest.booking_id) navigate(`/app/bookings/${latest.booking_id}`)
          else navigate('/app/notifications')
        }}
      >
        <div className="w-9 h-9 rounded-[10px] bg-accent-soft flex items-center justify-center shrink-0">
          <svg className="w-[18px] h-[18px] text-accent-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-brand text-sm font-bold text-[#92400E]">{latest.title}</p>
          <p className="text-[0.78rem] text-secondary mt-0.5 line-clamp-2">{latest.description}</p>
          <p className="text-[0.65rem] font-semibold text-brand mt-1.5">Tap to view details</p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setDismissed((s) => new Set(s).add(latest.id)) }}
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
