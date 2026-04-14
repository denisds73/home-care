import { memo } from 'react'

interface RescheduleCounterProps {
  current: number
  max: number
}

export const RescheduleCounter = memo(({ current, max }: RescheduleCounterProps) => {
  return (
    <div className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-muted tracking-wide">
      <span>{current} of {max}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < current ? 'bg-brand' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  )
})

RescheduleCounter.displayName = 'RescheduleCounter'
