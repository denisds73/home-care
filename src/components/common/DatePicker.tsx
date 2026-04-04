import { memo, useState, useRef, useEffect, useCallback } from 'react'

interface DatePickerProps {
  value: string | null
  onChange: (date: string) => void
  minDate?: string
  maxDate?: string
  disabledDates?: string[]
  placeholder?: string
  label?: string
  error?: string
  id?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseISO(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface DayCell {
  day: number; iso: string; isCurrentMonth: boolean
  isToday: boolean; isSelected: boolean; isDisabled: boolean
}

export const DatePicker = memo(function DatePicker({
  value, onChange, minDate, maxDate, disabledDates,
  placeholder = 'Select a date', label, error, id,
}: DatePickerProps) {
  const todayISO = new Date().toISOString().split('T')[0]
  const initial = value ? parseISO(value) : parseISO(todayISO)
  const [isOpen, setIsOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [viewMonth, setViewMonth] = useState(initial.month)
  const [viewYear, setViewYear] = useState(initial.year)
  const [focusedISO, setFocusedISO] = useState<string>(value ?? todayISO)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const disabledSet = new Set(disabledDates ?? [])

  const isDateDisabled = useCallback((iso: string): boolean => {
    if (disabledSet.has(iso)) return true
    if (minDate && iso < minDate) return true
    if (maxDate && iso > maxDate) return true
    return false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate, maxDate, disabledDates])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const buildGrid = (): DayCell[] => {
    const cells: DayCell[] = []
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const pm = viewMonth === 0 ? 11 : viewMonth - 1
    const py = viewMonth === 0 ? viewYear - 1 : viewYear
    const daysInPrev = new Date(py, pm + 1, 0).getDate()
    const makeCell = (y: number, m: number, d: number, cur: boolean): DayCell => {
      const iso = toISO(y, m, d)
      return { day: d, iso, isCurrentMonth: cur, isToday: iso === todayISO, isSelected: iso === value, isDisabled: isDateDisabled(iso) }
    }
    for (let i = firstDay - 1; i >= 0; i--) cells.push(makeCell(py, pm, daysInPrev - i, false))
    for (let d = 1; d <= daysInMonth; d++) cells.push(makeCell(viewYear, viewMonth, d, true))
    const nm = viewMonth === 11 ? 0 : viewMonth + 1
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear
    for (let d = 1; cells.length < 42; d++) cells.push(makeCell(ny, nm, d, false))
    return cells
  }

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta, y = viewYear
    if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
    setViewMonth(m); setViewYear(y)
  }

  const selectDate = (iso: string) => {
    if (isDateDisabled(iso)) return
    onChange(iso); setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    const { year, month, day } = parseISO(focusedISO)
    let next: Date | null = null
    switch (e.key) {
      case 'ArrowLeft': next = new Date(year, month, day - 1); break
      case 'ArrowRight': next = new Date(year, month, day + 1); break
      case 'ArrowUp': next = new Date(year, month, day - 7); break
      case 'ArrowDown': next = new Date(year, month, day + 7); break
      case 'Enter': case ' ': e.preventDefault(); selectDate(focusedISO); return
      case 'Escape': e.preventDefault(); setIsOpen(false); return
      default: return
    }
    e.preventDefault()
    if (next) {
      const iso = toISO(next.getFullYear(), next.getMonth(), next.getDate())
      if (!isDateDisabled(iso)) {
        setFocusedISO(iso)
        if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
          setViewMonth(next.getMonth()); setViewYear(next.getFullYear())
        }
      }
    }
  }

  const grid = buildGrid()
  const BASE = 'flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-colors select-none'
  const cellClass = (c: DayCell): string => {
    if (c.isDisabled) return `${BASE} opacity-40 cursor-not-allowed`
    if (c.isSelected) return `${BASE} bg-brand text-white font-bold cursor-pointer`
    if (!c.isCurrentMonth) return `${BASE} text-muted opacity-50 cursor-pointer hover:bg-brand-soft`
    if (c.isToday) return `${BASE} text-brand font-bold ring-2 ring-brand/30 cursor-pointer hover:bg-brand-soft`
    if (c.iso === focusedISO) return `${BASE} bg-brand-soft text-primary cursor-pointer`
    return `${BASE} text-primary cursor-pointer hover:bg-brand-soft`
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary mb-1">
          {label} <span className="text-error">*</span>
        </label>
      )}
      <button
        ref={triggerRef}
        id={id} type="button"
        onClick={() => {
          if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpenUp(spaceBelow < 360)
          }
          setIsOpen(prev => !prev)
          if (value) { const p = parseISO(value); setViewMonth(p.month); setViewYear(p.year); setFocusedISO(value) }
        }}
        className={`input-base w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
        aria-haspopup="dialog" aria-expanded={isOpen}
      >
        <span className={value ? 'text-primary' : 'text-muted'}>{value ? formatDisplay(value) : placeholder}</span>
        <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {error && <p className="text-xs text-error mt-1">{error}</p>}

      {isOpen && (
        <div role="dialog" aria-label="Choose date" className={`absolute left-0 right-0 z-50 glass-card p-3 fade-in ${openUp ? 'bottom-full mb-1' : 'mt-1'}`}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => navigateMonth(-1)} className="btn-base w-9 h-9 rounded-lg hover:bg-brand-soft" aria-label="Previous month">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span aria-live="polite" className="text-sm font-bold text-primary">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={() => navigateMonth(1)} className="btn-base w-9 h-9 rounded-lg hover:bg-brand-soft" aria-label="Next month">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-muted py-1">{d}</div>)}
          </div>
          <div role="grid" className="grid grid-cols-7">
            {grid.map(cell => (
              <div key={cell.iso} role="gridcell" aria-selected={cell.isSelected} aria-disabled={cell.isDisabled}
                tabIndex={cell.iso === focusedISO ? 0 : -1} className={cellClass(cell)}
                onClick={() => !cell.isDisabled && selectDate(cell.iso)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDate(cell.iso) } }}>
                {cell.day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'
