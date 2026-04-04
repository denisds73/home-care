import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { partnerService } from '../../services/partnerService'
import type { Job, Partner } from '../../types/domain'

function formatCurrency(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN')
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const map: Record<Job['status'], { label: string; cls: string }> = {
    new: { label: 'New', cls: 'badge badge-pay-pending' },
    accepted: { label: 'Accepted', cls: 'badge badge-confirmed' },
    in_progress: { label: 'In Progress', cls: 'badge badge-in-progress' },
    completed: { label: 'Completed', cls: 'badge badge-completed' },
    declined: { label: 'Declined', cls: 'badge badge-cancelled' },
  }
  const { label, cls } = map[status]
  return <span className={cls}>{label}</span>
}

function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-3 w-20 bg-muted rounded" />
      <div className="h-6 w-16 bg-muted rounded mt-2" />
      <div className="h-3 w-24 bg-muted rounded mt-2" />
    </div>
  )
}

export default function PartnerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const [profile, setProfile] = useState<Partner | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [earnings, setEarnings] = useState<{
    totalEarnings: number
    completedJobs: number
    averagePerJob: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, jobsRes, earningsRes] = await Promise.all([
          partnerService.getProfile(),
          partnerService.getSchedule(),
          partnerService.getEarnings(),
        ])
        setProfile(profileRes.data)
        setJobs(jobsRes.data)
        setEarnings(earningsRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const todaysJobs = useMemo(
    () => jobs.filter((j) => j.preferredDate === todayStr),
    [jobs, todayStr],
  )

  const upcomingJobs = useMemo(
    () =>
      jobs.filter((j) =>
        ['new', 'accepted', 'in_progress'].includes(j.status),
      ),
    [jobs],
  )

  const completionRate = useMemo(() => {
    const completed = jobs.filter((j) => j.status === 'completed').length
    const total = jobs.filter(
      (j) => j.status === 'completed' || j.status === 'declined',
    ).length
    return total === 0 ? 0 : Math.round((completed / total) * 100)
  }, [jobs])

  if (error) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <p className="text-error text-sm mb-4">{error}</p>
        <button
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  const stats = [
    {
      label: "Today's Jobs",
      value: todaysJobs.length,
      sub: 'Scheduled today',
      borderCls: 'stat-border-primary',
    },
    {
      label: 'Total Earnings',
      value: earnings ? formatCurrency(earnings.totalEarnings) : '--',
      sub: 'All time',
      borderCls: 'stat-border-success',
    },
    {
      label: 'Rating',
      value: profile?.rating?.toFixed(1) ?? '--',
      sub: 'Average rating',
      borderCls: 'stat-border-warning',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      sub: 'Jobs completed',
      borderCls: 'stat-border-info',
    },
  ]

  return (
    <div className="fade-in space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Welcome back, {user?.name ?? 'Partner'}
        </h1>
        <p className="text-muted text-sm mt-1">
          Here's your performance overview for today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s) => (
              <div key={s.label} className={`stat-card ${s.borderCls}`}>
                <p className="text-muted text-xs font-medium">{s.label}</p>
                <p className="font-brand text-xl font-bold text-primary mt-1">
                  {s.value}
                </p>
                <p className="text-muted text-xs mt-1">{s.sub}</p>
              </div>
            ))}
      </div>

      {/* Earnings Summary */}
      {!isLoading && earnings && (
        <div className="glass-card p-5">
          <h2 className="font-brand text-base font-semibold text-primary mb-4">
            Earnings Summary
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(earnings.totalEarnings)}
              </p>
              <p className="text-xs text-muted">Total Earned</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">
                {earnings.completedJobs}
              </p>
              <p className="text-xs text-muted">Jobs Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(earnings.averagePerJob)}
              </p>
              <p className="text-xs text-muted">Avg Per Job</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Jobs */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-semibold text-primary mb-4">
          Upcoming Jobs
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between p-3 rounded-xl bg-surface border border-default"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : upcomingJobs.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">
            No upcoming jobs right now.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-default"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary truncate">
                    {job.serviceName}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {job.customerName} · {job.timeSlot}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <StatusBadge status={job.status} />
                  <span className="font-bold text-brand text-sm">
                    {formatCurrency(job.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
