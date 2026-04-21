import { memo, useState } from 'react'
import { useLocationStore } from '../../store/useLocationStore'
import { STATES, getCitiesByState } from '../../data/cities'

export const ServiceabilityBanner = memo(() => {
  const serviceable = useLocationStore((s) => s.serviceable)
  const location = useLocationStore((s) => s.location)
  const bannerDismissed = useLocationStore((s) => s.bannerDismissed)
  const dismissBanner = useLocationStore((s) => s.dismissBanner)
  const [expanded, setExpanded] = useState(false)

  if (serviceable || bannerDismissed || !location) return null

  const locationLabel = location.city || location.label || 'your area'

  return (
    <div
      className="fade-in"
      style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Location pin icon */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              We&apos;re expanding to {locationLabel} soon!
            </p>
            <div className="flex flex-wrap items-center gap-x-1">
              <p className="text-xs text-white/70">
                Currently serving 22 cities across Kerala, Tamil Nadu &amp; Karnataka.
              </p>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-white/90 hover:text-white transition shrink-0"
              >
                {expanded ? 'Hide cities' : 'See all cities'}
                <svg
                  className="w-3 h-3 transition-transform"
                  style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={dismissBanner}
            className="w-7 h-7 flex items-center justify-center rounded-full shrink-0 transition"
            style={{ background: 'rgba(255,255,255,.1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
            aria-label="Dismiss notice"
          >
            <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Expanded cities — glass panel */}
        {expanded && (
          <div
            className="mt-3 mb-1 rounded-xl p-4 fade-in grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{
              background: 'rgba(255,255,255,.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,.15)',
            }}
          >
            {STATES.map((state) => {
              const cities = getCitiesByState(state.id)
              return (
                <div key={state.id}>
                  <p className="text-xs font-bold text-white/90 mb-1.5">{state.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cities.map((c) => (
                      <span
                        key={c.name}
                        className="text-[11px] px-2 py-0.5 rounded-full text-white/80 font-medium"
                        style={{ background: 'rgba(255,255,255,.12)' }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})

ServiceabilityBanner.displayName = 'ServiceabilityBanner'
