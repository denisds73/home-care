import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  label?: string
  disabled?: boolean
  className?: string
  error?: string
  id?: string
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  searchPlaceholder = 'Search…',
  label,
  disabled = false,
  className = '',
  error,
  id,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [menuCoords, setMenuCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  )

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query, searchable])

  const toggle = useCallback(() => {
    if (disabled) return
    setOpen((prev) => {
      const next = !prev
      if (next) {
        setQuery('')
        setActiveIndex(-1)
        const r = buttonRef.current?.getBoundingClientRect()
        if (r) {
          setMenuCoords({ top: r.bottom + 4, left: r.left, width: r.width })
        }
      }
      return next
    })
  }, [disabled])

  const select = useCallback(
    (opt: DropdownOption) => {
      onChange(opt.value)
      setOpen(false)
      setQuery('')
    },
    [onChange],
  )

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open, searchable])

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const update = () => {
      const r = buttonRef.current!.getBoundingClientRect()
      setMenuCoords({
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (containerRef.current?.contains(t)) return
      if (menuPanelRef.current?.contains(t)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        toggle()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && filtered[activeIndex]) {
          select(filtered[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setQuery('')
        break
      case 'Tab':
        setOpen(false)
        setQuery('')
        break
    }
  }

  const listboxId = id ? `${id}-listbox` : undefined

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-text-secondary uppercase mb-1"
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`
          input-base flex items-center justify-between w-full px-3.5 py-2.5 text-sm
          text-left cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-error!' : ''}
        `}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-muted'}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuPanelRef}
            className="
              fixed z-[300]
              bg-white border border-border rounded-xl shadow-lg
              overflow-hidden animate-in fade-in slide-in-from-top-1
            "
            style={{
              top: menuCoords.top,
              left: menuCoords.left,
              width: menuCoords.width,
              animation: 'dropdown-in 150ms ease-out',
            }}
            role="presentation"
          >
            {searchable && (
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setActiveIndex(-1)
                    }}
                    placeholder={searchPlaceholder}
                    className="
                      w-full pl-9 pr-3 py-2 text-sm rounded-lg
                      border border-border bg-surface
                      text-text-primary placeholder:text-text-muted
                      focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15
                    "
                    aria-label="Search options"
                  />
                </div>
              </div>
            )}

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label ?? 'Options'}
              className="max-h-56 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3.5 py-2.5 text-sm text-text-muted text-center">
                  No results found
                </li>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected = opt.value === value
                  const isActive = i === activeIndex
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => select(opt)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`
                        px-3.5 py-2.5 text-sm cursor-pointer transition-colors
                        ${isSelected
                          ? 'bg-primary/8 text-primary font-medium'
                          : isActive
                            ? 'bg-muted text-text-primary'
                            : 'text-text-primary hover:bg-muted'
                        }
                      `}
                    >
                      {opt.label}
                    </li>
                  )
                })
              )}
            </ul>
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
