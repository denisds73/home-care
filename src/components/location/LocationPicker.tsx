import { useEffect, useRef, useCallback } from 'react'
import useStore from '../../store/useStore'
import { LocationPickerContent } from './LocationPickerContent'

export function LocationPicker() {
  const open = useStore(s => s.locationPickerOpen)
  const setOpen = useStore(s => s.setLocationPickerOpen)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [setOpen])

  // Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus first interactive element
  useEffect(() => {
    if (!open || !panelRef.current) return
    const el = panelRef.current.querySelector<HTMLElement>(
      'input, button:not([disabled])',
    )
    el?.focus()
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-[54] bg-black/50 backdrop-blur-[2px] border-0 cursor-default p-0 m-0 w-full h-full"
        aria-label="Close location picker"
        onClick={close}
        style={{ animation: 'fadeIn .15s ease-out both' }}
      />

      {/* Panel — bottom sheet on mobile, centered modal on md+ */}
      <div
        ref={panelRef}
        className="fixed z-[56] bg-white slide-up overflow-hidden
          bottom-0 left-0 right-0 rounded-t-3xl border-t border-default
          md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:rounded-2xl md:border md:max-w-[480px] md:w-full"
        style={{ boxShadow: '0 -8px 50px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.03)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Set service location"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <LocationPickerContent onClose={close} />
      </div>
    </>
  )
}
