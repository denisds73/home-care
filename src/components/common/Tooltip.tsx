import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'

type TooltipProps = {
  label: string
  children: ReactElement<{
    className?: string
    'aria-describedby'?: string
  }>
}

export default function Tooltip({ label, children }: TooltipProps) {
  const tipId = useId()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  const updatePos = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    if (r.top < 56) {
      setPlacement('bottom')
      setPos({ top: r.bottom, left: cx })
    } else {
      setPlacement('top')
      setPos({ top: r.top, left: cx })
    }
  }, [])

  const show = useCallback(() => {
    updatePos()
    setOpen(true)
  }, [updatePos])

  const hide = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const fn = () => updatePos()
    window.addEventListener('scroll', fn, true)
    window.addEventListener('resize', fn)
    return () => {
      window.removeEventListener('scroll', fn, true)
      window.removeEventListener('resize', fn)
    }
  }, [open, updatePos])

  const child = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': open ? tipId : undefined,
      } as Partial<
        { 'aria-describedby'?: string } & { className?: string }
      >)
    : children

  const portalStyle: CSSProperties =
    placement === 'top'
      ? {
          position: 'fixed',
          top: pos.top - 8,
          left: pos.left,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
        }
      : {
          position: 'fixed',
          top: pos.top + 8,
          left: pos.left,
          transform: 'translate(-50%, 0)',
          zIndex: 9999,
        }

  return (
    <>
      <span
        ref={wrapRef}
        className="relative inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {child}
      </span>
      {open &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            style={portalStyle}
            className="pointer-events-none max-w-[min(240px,90vw)] whitespace-normal rounded-lg bg-[var(--color-text-primary)] px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-[var(--color-card)] shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  )
}
