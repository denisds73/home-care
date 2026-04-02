import type { ReactElement } from 'react'
import useStore from '../../store/useStore'
import type { ToastType } from '../../types/domain'

const icons: Record<ToastType, ReactElement> = {
  success: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  danger: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  warning: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  info: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
}
const colors: Record<ToastType, string> = {
  success: 'var(--color-success)',
  danger: 'var(--color-error)',
  warning: 'var(--color-accent)',
  info: 'var(--color-primary)',
}

export default function Toast() {
  const toast = useStore(s => s.toast)
  if (!toast) return null
  const type = toast.type
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50" role="alert">
      <div
        className="px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 scale-in"
        style={{ background: colors[type] }}>
        {icons[type]}
        <span>{toast.msg}</span>
      </div>
    </div>
  )
}
