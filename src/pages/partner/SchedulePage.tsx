import { useState, useEffect, useMemo } from 'react'
import { partnerService } from '../../services/partnerService'
import useStore from '../../store/useStore'
import type { Job } from '../../types/domain'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const dayIndex = date.getDay()
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return map[dayIndex]
}

export default function SchedulePage() {
  const showToast = useStore((s) => s.showToast)
  const [scheduleJobs, setScheduleJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [availability, setAvailability] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {}
      DAYS.forEach((day) => {
        initial[day] = day !== 'Sun'
      })
      return initial
    },
  )

  useEffect(() => {
    const load = async () => {
      try {
        const res = await partnerService.getSchedule()
        setScheduleJobs(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const jobsByDay = useMemo(() => {
    const map: Record<string, Job[]> = {}
    for (const job of scheduleJobs) {
      const dayLabel = getDayLabel(job.preferredDate)
      if (!map[dayLabel]) map[dayLabel] = []
      map[dayLabel].push(job)
    }
    return map
  }, [scheduleJobs])

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const handleSave = () => {
    showToast('Schedule updated', 'success')
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Schedule
        </h1>
        <p className="text-muted text-sm mt-1">
          Set your working days and availability.
        </p>
      </div>

      {isLoading ? (
        <div className="glass-card p-5 animate-pulse space-y-3">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      ) : error ? (
        <div className="glass-card p-5 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {scheduleJobs.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-primary mb-3">
                This Week's Jobs ({scheduleJobs.length})
              </h2>
              <div className="space-y-2">
                {scheduleJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface border border-default text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-primary truncate">
                        {job.serviceName}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {job.customerName} · {job.preferredDate}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        job.status === 'completed'
                          ? 'badge-completed'
                          : job.status === 'in_progress'
                            ? 'badge-in-progress'
                            : job.status === 'accepted'
                              ? 'badge-confirmed'
                              : 'badge-pay-pending'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">
          Weekly Availability
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const dayJobs = jobsByDay[day] ?? []
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-sm font-semibold transition min-h-[64px] ${
                  availability[day]
                    ? 'bg-brand-soft text-brand border-2 border-brand/20'
                    : 'bg-muted text-muted border-2 border-transparent'
                }`}
              >
                <span>{day}</span>
                <span className="text-xs font-normal">
                  {dayJobs.length > 0
                    ? `${dayJobs.length} job${dayJobs.length > 1 ? 's' : ''}`
                    : availability[day]
                      ? 'Available'
                      : 'Off'}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn-base btn-primary text-sm mt-6 px-5 py-2 min-h-[44px]"
        >
          Save Schedule
        </button>
      </div>
    </div>
  )
}
