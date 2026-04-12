import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { technicianService } from '../../services/technicianService'
import type { Booking, Technician } from '../../types/domain'

interface Counts {
  assigned: number
  inProgress: number
  completedToday: number
}

function isToday(iso?: string | null): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const t = new Date()
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  )
}

export default function TechnicianDashboardPage() {
  const [me, setMe] = useState<Technician | null>(null)
  const [counts, setCounts] = useState<Counts>({
    assigned: 0,
    inProgress: 0,
    completedToday: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [profile, accepted, inProgress, completed] = await Promise.all([
        technicianService.getMe().catch(() => null),
        bookingService.listForTechnician({ status: 'accepted' }),
        bookingService.listForTechnician({ status: 'in_progress' }),
        bookingService.listForTechnician({ status: 'completed' }),
      ])
      setMe(profile)
      setCounts({
        assigned: accepted.length,
        inProgress: inProgress.length,
        completedToday: completed.filter((b: Booking) =>
          isToday(b.completed_at),
        ).length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-5 animate-pulse">
          <div className="h-4 w-32 bg-surface rounded mb-2" />
          <div className="h-3 w-24 bg-surface rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="font-brand text-xl font-bold text-primary">
          {me ? `Hi, ${me.full_name.split(' ')[0]}` : 'Hi there'}
        </h1>
        <p className="text-muted text-sm mt-1">Here is your day at a glance.</p>
      </div>

      {error && (
        <div className="glass-card p-4 text-center">
          <p className="text-error text-xs mb-2">{error}</p>
          <button
            type="button"
            onClick={load}
            className="btn-base btn-primary text-xs px-4 py-1 min-h-[36px]"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-brand font-bold text-primary">
            {counts.assigned}
          </p>
          <p className="text-[10px] uppercase text-muted tracking-wider mt-1">
            To start
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-brand font-bold text-primary">
            {counts.inProgress}
          </p>
          <p className="text-[10px] uppercase text-muted tracking-wider mt-1">
            In progress
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-brand font-bold text-primary">
            {counts.completedToday}
          </p>
          <p className="text-[10px] uppercase text-muted tracking-wider mt-1">
            Done today
          </p>
        </div>
      </div>

      <Link
        to="/technician/jobs"
        className="btn-base btn-primary w-full py-3 text-sm font-semibold text-center min-h-[48px] flex items-center justify-center"
      >
        View all jobs
      </Link>
    </div>
  )
}
