import { useState, useEffect, useMemo } from 'react'
import { partnerService } from '../../services/partnerService'
import useStore from '../../store/useStore'
import type { Job, TimeSlot } from '../../types/domain'

const TIME_SLOTS: TimeSlot[] = ['9AM-12PM', '12PM-3PM', '3PM-6PM']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const dayIndex = date.getDay()
  // getDay: 0=Sun,1=Mon,...6=Sat -> map to our DAYS array
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
        TIME_SLOTS.forEach((slot) => {
          initial[`${day}-${slot}`] = day !== 'Sun'
        })
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

  // Map jobs to day-slot keys for display
  const jobsBySlot = useMemo(() => {
    const map: Record<string, Job[]> = {}
    for (const job of scheduleJobs) {
      const dayLabel = getDayLabel(job.preferredDate)
      const key = `${dayLabel}-${job.timeSlot}`
      if (!map[key]) map[key] = []
      map[key].push(job)
    }
    return map
  }, [scheduleJobs])

  const toggleSlot = (key: string) => {
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }))
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
          Set your working hours and availability.
        </p>
      </div>

      {/* Scheduled Jobs */}
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
          {/* Upcoming jobs summary */}
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
                        {job.customerName} · {job.preferredDate} · {job.timeSlot}
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">
                  Day
                </th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot}
                    className="text-center text-xs text-muted font-medium pb-3 px-2"
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="border-t border-gray-50">
                  <td className="py-3 pr-4 text-sm font-medium text-primary">
                    {day}
                  </td>
                  {TIME_SLOTS.map((slot) => {
                    const key = `${day}-${slot}`
                    const slotJobs = jobsBySlot[key] ?? []
                    return (
                      <td key={slot} className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSlot(key)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
                            availability[key]
                              ? 'bg-brand-soft text-brand'
                              : 'bg-muted text-muted'
                          }`}
                        >
                          {slotJobs.length > 0
                            ? `${slotJobs.length} job${slotJobs.length > 1 ? 's' : ''}`
                            : availability[key]
                              ? 'Available'
                              : 'Off'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {DAYS.map((day) => (
            <div key={day}>
              <p className="text-sm font-medium text-primary mb-2">{day}</p>
              <div className="flex gap-2 flex-wrap">
                {TIME_SLOTS.map((slot) => {
                  const key = `${day}-${slot}`
                  const slotJobs = jobsBySlot[key] ?? []
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(key)}
                      className={`flex-1 min-w-[88px] py-2 rounded-lg text-xs font-semibold transition whitespace-pre-line text-center ${
                        availability[key]
                          ? 'bg-brand-soft text-brand'
                          : 'bg-muted text-muted'
                      }`}
                    >
                      {slotJobs.length > 0
                        ? `${slot}\n${slotJobs.length} job${slotJobs.length > 1 ? 's' : ''}`
                        : slot.replace('-', '\n')}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
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
