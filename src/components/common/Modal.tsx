import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
  /** Optional header row with title and close control */
  title?: string
  /** `layout` = cover main dashboard column (right of 240px sidebar) and center the dialog there */
  overlay?: 'viewport' | 'layout'
}

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  title,
  overlay = 'viewport',
}: ModalProps) {
  const titleId = useId()
  const showHeader = Boolean(title?.trim())
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null
  /** Portal keeps `fixed` tied to the viewport (avoids transformed ancestors). `min-h-dvh` matches visible height so flex centers with even top/bottom inset. */
  const overlayClass =
    overlay === 'layout'
      ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] overflow-hidden min-h-dvh min-[769px]:left-[240px]'
      : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] overflow-hidden min-h-dvh'
  const panelBase = `bg-card border border-default rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90dvh] scale-in`
  const modal = (
    <div
      className={overlayClass}
      onClick={onClose}
      role="presentation"
    >
      {showHeader ? (
        <div
          className={`${panelBase} flex flex-col overflow-hidden`}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-default shrink-0">
            <h2 id={titleId} className="text-lg font-bold text-primary truncate pr-2">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors duration-150 shrink-0 text-secondary hover:text-primary"
              aria-label="Close dialog"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
        </div>
      ) : (
        <div
          className={`${panelBase} overflow-y-auto`}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      )}
    </div>
  )
  return createPortal(modal, document.body)
}
