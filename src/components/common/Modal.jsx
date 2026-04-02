import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-card border border-default rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto scale-in`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}
