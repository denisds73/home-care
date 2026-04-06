import { memo, useEffect, useRef, useState, useCallback } from 'react'
import useStore from '../../store/useStore'
import type { ToastItem, ToastType } from '../../types/domain'

/* ── Icon set ─────────────────────────────────────────────── */

const iconPaths: Record<ToastType, string> = {
  success: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  danger: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  warning: 'M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
}

const accentColors: Record<ToastType, { ring: string; icon: string; bg: string; border: string }> = {
  success: {
    ring: '#16A34A',
    icon: '#16A34A',
    bg: 'rgba(22, 163, 74, 0.06)',
    border: 'rgba(22, 163, 74, 0.12)',
  },
  danger: {
    ring: '#DC2626',
    icon: '#DC2626',
    bg: 'rgba(220, 38, 38, 0.06)',
    border: 'rgba(220, 38, 38, 0.12)',
  },
  warning: {
    ring: '#D97706',
    icon: '#D97706',
    bg: 'rgba(217, 119, 6, 0.06)',
    border: 'rgba(217, 119, 6, 0.12)',
  },
  info: {
    ring: '#6D28D9',
    icon: '#6D28D9',
    bg: 'rgba(109, 40, 217, 0.06)',
    border: 'rgba(109, 40, 217, 0.12)',
  },
}

/* ── Progress ring (SVG circle) ───────────────────────────── */

const RING_R = 11
const RING_C = 2 * Math.PI * RING_R

function ProgressRing({ duration, color, paused }: { duration: number; color: string; paused: boolean }) {
  return (
    <svg className="absolute inset-0 -rotate-90" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={RING_R} fill="none" stroke="currentColor" strokeWidth="2" className="text-border/30" />
      <circle
        cx="14" cy="14" r={RING_R}
        fill="none" stroke={color} strokeWidth="2"
        strokeDasharray={RING_C}
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{
          animation: `toastRingDrain ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </svg>
  )
}

/* ── Single toast item ────────────────────────────────────── */

const ToastCard = memo(({ item, index, total }: { item: ToastItem; index: number; total: number }) => {
  const dismissToast = useStore(s => s.dismissToast)
  const [exiting, setExiting] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const startXRef = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const colors = accentColors[item.type]
  const stackOffset = (total - 1 - index)
  const isStacked = stackOffset > 0

  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => dismissToast(item.id), 280)
  }, [dismissToast, item.id])

  // Swipe-to-dismiss (touch)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    setSwiping(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return
    const dx = e.touches[0].clientX - startXRef.current
    setSwipeX(dx)
  }, [swiping])

  const onTouchEnd = useCallback(() => {
    setSwiping(false)
    if (Math.abs(swipeX) > 100) {
      handleDismiss()
    } else {
      setSwipeX(0)
    }
  }, [swipeX, handleDismiss])

  // Swipe-to-dismiss (mouse)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startXRef.current = e.clientX
    setSwiping(true)

    const onMove = (ev: MouseEvent) => {
      setSwipeX(ev.clientX - startXRef.current)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      setSwiping(false)
      setSwipeX(prev => {
        if (Math.abs(prev) > 100) {
          setExiting(true)
          setTimeout(() => dismissToast(item.id), 280)
        }
        return 0
      })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [dismissToast, item.id])

  // Keyboard dismiss
  useEffect(() => {
    if (index !== total - 1) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [index, total, handleDismiss])

  const swipeOpacity = Math.max(0, 1 - Math.abs(swipeX) / 200)

  return (
    <div
      ref={cardRef}
      role="alert"
      aria-live={item.type === 'danger' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      className="select-none touch-pan-y"
      style={{
        position: 'absolute',
        top: `${stackOffset * 8}px`,
        left: 0,
        right: 0,
        transform: `
          translateX(${swipeX}px)
          scale(${isStacked ? 1 - stackOffset * 0.04 : 1})
        `,
        opacity: isStacked ? Math.max(0.4, 1 - stackOffset * 0.25) * swipeOpacity : swipeOpacity,
        zIndex: index,
        transition: swiping ? 'none' : 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: !exiting
          ? 'toastSlideIn 0.36s cubic-bezier(0.16, 1, 0.3, 1) both'
          : 'toastSlideOut 0.28s cubic-bezier(0.55, 0, 1, 0.45) both',
        cursor: 'grab',
        pointerEvents: isStacked ? 'none' : 'auto',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          border: `1px solid ${colors.border}`,
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
          style={{ background: `linear-gradient(90deg, ${colors.ring}, ${colors.ring}88, transparent)` }}
        />

        <div className="flex items-start gap-3 px-4 py-3">
          {/* Icon with progress ring */}
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ width: 28, height: 28 }}
          >
            <ProgressRing duration={item.duration} color={colors.ring} paused={hovered} />
            <svg className="w-3.5 h-3.5 relative z-10" fill="none" viewBox="0 0 24 24" stroke={colors.icon} strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[item.type]} />
            </svg>
          </div>

          {/* Message + action */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[13px] font-semibold leading-snug text-primary">
              {item.msg}
            </p>
            {item.action && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  item.action?.onClick()
                  handleDismiss()
                }}
                className="mt-1 text-xs font-bold hover:underline transition-colors"
                style={{ color: colors.icon }}
              >
                {item.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors text-muted mt-0.5"
            aria-label="Dismiss notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

ToastCard.displayName = 'ToastCard'

/* ── Container ────────────────────────────────────────────── */

export default function Toast() {
  const toasts = useStore(s => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed z-[60] pointer-events-none left-1/2 -translate-x-1/2"
      style={{
        top: 'max(72px, env(safe-area-inset-top, 0px) + 72px)',
        width: 'min(380px, calc(100% - 32px))',
      }}
    >
      <div className="relative pointer-events-auto" style={{ height: `${Math.max(56, 56 + (toasts.length - 1) * 8)}px` }}>
        {toasts.map((item, i) => (
          <ToastCard key={item.id} item={item} index={i} total={toasts.length} />
        ))}
      </div>
    </div>
  )
}
