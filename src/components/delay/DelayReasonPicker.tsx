import { memo } from 'react'
import type { DelayReason, DelayType } from '../../types/delay'
import { getReasonsForType } from '../../utils/delayReasons'

interface DelayReasonPickerProps {
  delayType: DelayType | 'reschedule'
  selected: DelayReason | null
  onSelect: (reason: DelayReason) => void
}

export const DelayReasonPicker = memo(
  ({ delayType, selected, onSelect }: DelayReasonPickerProps) => {
    const reasons = getReasonsForType(delayType)

    return (
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select reason">
        {reasons.map((r) => {
          const isSelected = selected === r.value
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(r.value)}
              className={`px-3.5 py-2 rounded-[10px] text-[0.78rem] font-semibold border-[1.5px] transition-all min-h-[40px] ${
                isSelected
                  ? 'border-warning bg-accent-soft text-accent-strong'
                  : 'border-border bg-card text-text-secondary hover:border-text-muted hover:bg-surface'
              }`}
            >
              {r.label}
            </button>
          )
        })}
      </div>
    )
  },
)

DelayReasonPicker.displayName = 'DelayReasonPicker'
