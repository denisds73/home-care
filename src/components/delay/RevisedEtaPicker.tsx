import { memo, useMemo } from 'react'

interface RevisedEtaPickerProps {
  value: string
  onChange: (isoTime: string) => void
}

function formatTimeDisplay(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime)
    if (isNaN(d.getTime())) return isoOrTime
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return isoOrTime
  }
}

function minutesFromNow(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime)
    if (isNaN(d.getTime())) return ''
    const diff = Math.round((d.getTime() - Date.now()) / 60000)
    if (diff <= 0) return 'now'
    if (diff < 60) return `~${diff} min from now`
    const hrs = Math.floor(diff / 60)
    const mins = diff % 60
    return mins > 0 ? `~${hrs}h ${mins}m from now` : `~${hrs}h from now`
  } catch {
    return ''
  }
}

export const RevisedEtaPicker = memo(({ value, onChange }: RevisedEtaPickerProps) => {
  const display = useMemo(() => formatTimeDisplay(value), [value])
  const helper = useMemo(() => minutesFromNow(value), [value])

  return (
    <div className="flex items-center gap-3">
      <input
        type="time"
        value={value.includes('T') ? value.slice(11, 16) : value}
        onChange={(e) => {
          const today = new Date().toISOString().slice(0, 10)
          onChange(`${today}T${e.target.value}:00`)
        }}
        className="input-base px-4 py-2.5 font-brand text-lg font-bold text-warning tabular-nums min-h-[44px]"
        aria-label="Revised arrival time"
      />
      <div className="text-xs text-muted">
        {display}
        {helper && <span className="block mt-0.5">{helper}</span>}
      </div>
    </div>
  )
})

RevisedEtaPicker.displayName = 'RevisedEtaPicker'
