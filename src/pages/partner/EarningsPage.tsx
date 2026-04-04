import { useState, useEffect } from 'react'
import { partnerService } from '../../services/partnerService'

type Period = 'daily' | 'weekly' | 'monthly'

function formatCurrency(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN')
}

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('weekly')
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
        const res = await partnerService.getEarnings()
        setEarnings(res.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load earnings')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const periodLabels: Record<Period, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Earnings
        </h1>
        <p className="text-muted text-sm mt-1">
          Track your income and request payouts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
              period === p
                ? 'bg-brand text-white'
                : 'bg-muted text-secondary hover:bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Hero earnings card */}
      <div
        className="glass-card p-6 text-white rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
        }}
      >
        <p className="text-sm opacity-80">{periodLabels[period]}</p>
        {isLoading ? (
          <div className="h-9 w-40 bg-white/20 rounded mt-1 animate-pulse" />
        ) : error ? (
          <p className="text-sm mt-1 opacity-80">Unable to load</p>
        ) : (
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(earnings?.totalEarnings ?? 0)}
          </p>
        )}
      </div>

      {/* Stats grid */}
      {!isLoading && earnings && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {earnings.completedJobs}
            </p>
            <p className="text-xs text-muted mt-1">Jobs Completed</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(earnings.averagePerJob)}
            </p>
            <p className="text-xs text-muted mt-1">Average Per Job</p>
          </div>
        </div>
      )}

      {/* Payout Summary */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">
          Payout Summary
        </h2>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ) : earnings ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Total Earned</span>
              <span className="font-semibold text-primary">
                {formatCurrency(earnings.totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Platform Fee (20%)</span>
              <span className="font-semibold text-primary">
                -{formatCurrency(Math.round(earnings.totalEarnings * 0.2))}
              </span>
            </div>
            <div className="h-px bg-muted" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-primary">Net Payout</span>
              <span className="font-bold text-brand">
                {formatCurrency(
                  Math.round(earnings.totalEarnings * 0.8),
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">No earnings data available.</p>
        )}
        <button
          type="button"
          className="btn-base btn-primary text-sm mt-4 px-5 py-2 min-h-[44px]"
        >
          Request Payout
        </button>
      </div>
    </div>
  )
}
