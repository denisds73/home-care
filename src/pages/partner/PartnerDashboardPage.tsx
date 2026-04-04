import { useMemo } from 'react'
import { mockJobs, weeklyEarnings } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'
import type { Job } from '../../types/domain'

const todayStr = '2026-04-04'

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN')
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

export default function PartnerDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const todaysJobs = useMemo(
    () => mockJobs.filter((j) => j.preferredDate === todayStr),
    [],
  )

  const weekTotal = useMemo(
    () => weeklyEarnings.reduce((sum, d) => sum + d.amount, 0),
    [],
  )

  const completedJobs = useMemo(
    () => mockJobs.filter((j) => j.status === 'completed'),
    [],
  )

  const completionRate = useMemo(() => {
    const total = mockJobs.filter(
      (j) => j.status === 'completed' || j.status === 'declined',
    ).length
    return total === 0 ? 0 : Math.round((completedJobs.length / total) * 100)
  }, [completedJobs])

  const upcomingJobs = useMemo(
    () =>
      mockJobs.filter((j) =>
        ['new', 'accepted', 'in_progress'].includes(j.status),
      ),
    [],
  )

  const maxEarning = useMemo(
    () => Math.max(...weeklyEarnings.map((d) => d.amount)),
    [],
  )

  const stats = [
    {
      label: "Today's Jobs",
      value: todaysJobs.length,
      sub: 'Scheduled today',
      borderCls: 'stat-border-primary',
      icon: '📋',
    },
    {
      label: 'Week Earnings',
      value: formatCurrency(weekTotal),
      sub: 'This week',
      borderCls: 'stat-border-success',
      icon: '💰',
    },
    {
      label: 'Rating',
      value: '4.8 ★',
      sub: 'Average rating',
      borderCls: 'stat-border-warning',
      icon: '⭐',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      sub: 'Jobs completed',
      borderCls: 'stat-border-info',
      icon: '✅',
    },
  ]

  return (
    <div className="fade-in space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Good morning, {user?.name ?? 'Partner'} 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          Here's your performance overview for today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.borderCls}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted text-xs font-medium">{s.label}</p>
                <p className="font-brand text-xl font-bold text-primary mt-1">
                  {s.value}
                </p>
                <p className="text-muted text-xs mt-1">{s.sub}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Earnings Chart */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-semibold text-primary mb-4">
          Weekly Earnings
        </h2>
        <div className="flex items-end gap-2 h-40">
          {weeklyEarnings.map((d) => {
            const heightPct = maxEarning > 0 ? (d.amount / maxEarning) * 100 : 0
            return (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted font-medium">
                  {formatCurrency(d.amount)}
                </span>
                <div
                  className="w-full rounded-t-lg bg-brand-soft"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className="w-full h-full rounded-t-lg bg-brand opacity-70"
                    style={{ minHeight: '4px' }}
                  />
                </div>
                <span className="text-xs text-muted">{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-semibold text-primary mb-4">
          Upcoming Jobs
        </h2>
        {upcomingJobs.length === 0 ? (
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
