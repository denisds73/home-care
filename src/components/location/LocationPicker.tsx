import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../../store/useUIStore'
import { LocationPickerContent } from './LocationPickerContent'

export function LocationPicker() {
  const open = useUIStore(s => s.locationPickerOpen)
  const setOpen = useUIStore(s => s.setLocationPickerOpen)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [setOpen])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  useEffect(() => {
    if (!open || !panelRef.current) return
    const el = panelRef.current.querySelector<HTMLElement>(
      'button:not([disabled]), input, textarea',
    )
    el?.focus()
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-[54] bg-black/40 border-0 cursor-default p-0 m-0 w-full h-full"
        aria-label="Close location picker"
        onClick={close}
      />

      {/* Panel — bottom sheet on mobile, centered modal on md+ */}
      <div
        ref={panelRef}
        className="fixed z-[56] bg-white shadow-[0_-8px_40px_rgba(0,0,0,.12)] slide-up
          bottom-0 left-0 right-0 rounded-t-2xl border-t border-default
          md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:rounded-2xl md:border md:max-w-md md:w-full md:shadow-[0_8px_40px_rgba(0,0,0,.14)]"
        role="dialog"
        aria-modal="true"
        aria-label="Set service location"
      >
        {/* Drag handle — mobile only */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2 shrink-0 md:hidden" />

        {/* Close button — desktop */}
        <button
          type="button"
          onClick={close}
          className="hidden md:flex absolute top-3 right-3 w-8 h-8 items-center justify-center rounded-full hover:bg-muted transition text-muted"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 pb-6 pt-1 max-h-[min(85vh,520px)] overflow-y-auto">
          <LocationPickerContent onClose={close} />
        </div>
      </div>
    </>
  )
}
