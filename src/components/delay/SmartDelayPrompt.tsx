import { memo, useMemo } from 'react'

interface SmartDelayPromptProps {
  scheduledTime: string
  preferredDate: string
  bookingStatus: string
  startedAt: string | null | undefined
  onReportDelay: () => void
  onStartService: () => void
}

function parseSlotStart(slot: string): string {
  const start = slot.split('-')[0]?.trim() ?? slot
  return start
}

function isOverdue(preferredDate: string, timeSlot: string): boolean {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (preferredDate !== today) return false

  const start = parseSlotStart(timeSlot)
  const match = start.match(/^(\d{1,2})(AM|PM)$/i)
  if (!match) return false

  let hour = parseInt(match[1], 10)
  const period = match[2].toUpperCase()
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  const slotDate = new Date(preferredDate)
  slotDate.setHours(hour, 0, 0, 0)
  return now > slotDate
}

export const SmartDelayPrompt = memo(({
  scheduledTime,
  preferredDate,
  bookingStatus,
  startedAt,
  onReportDelay,
  onStartService,
}: SmartDelayPromptProps) => {
  const shouldShow = useMemo(() => {
    if (bookingStatus !== 'accepted') return false
    if (startedAt) return false
    return isOverdue(preferredDate, scheduledTime)
  }, [bookingStatus, startedAt, preferredDate, scheduledTime])

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [])

  if (!shouldShow) return null

  return (
    <div className="relative glass-card no-hover overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D97706] to-[#D4A017]/50"
        style={{ maskImage: 'linear-gradient(to right, black 70%, transparent)' }}
      />
      <div className="p-4 text-center">
        <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-[22px] h-[22px] text-accent-strong"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="font-brand text-sm font-bold text-[#92400E]">
          Scheduled for {parseSlotStart(scheduledTime)}
        </p>
        <p className="text-[0.8rem] text-secondary mt-1">
          It's now {currentTime}. Are you running late?
        </p>
        <div className="flex gap-2 mt-3 justify-center">
          <button
            type="button"
            onClick={onReportDelay}
            className="btn-base py-2.5 px-5 text-[0.8rem] font-bold bg-[#D97706] text-white hover:bg-[#B45309] active:scale-[0.97] transition-all min-h-[44px]"
          >
            Yes, Report Delay
          </button>
          <button
            type="button"
            onClick={onStartService}
            className="btn-base btn-success py-2.5 px-5 text-[0.8rem] font-bold min-h-[44px]"
          >
            I'm Here
          </button>
        </div>
      </div>
    </div>
  )
})

SmartDelayPrompt.displayName = 'SmartDelayPrompt'
