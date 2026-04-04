import { useState } from 'react'
import { weeklyEarnings } from '../../data/mockData'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIOD_DATA: Record<Period, { label: string; total: number }> = {
  daily: { label: 'Today', total: 3200 },
  weekly: {
    label: 'This Week',
    total: weeklyEarnings.reduce((s, d) => s + d.amount, 0),
  },
  monthly: { label: 'This Month', total: 89500 },
}

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('weekly')
  const maxEarning = Math.max(...weeklyEarnings.map(d => d.amount))

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Earnings</h1>
        <p className="text-muted text-sm mt-1">Track your income and request payouts.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
              period === p ? 'bg-brand text-white' : 'bg-muted text-secondary hover:bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="glass-card p-6 text-white rounded-2xl"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
      >
        <p className="text-sm opacity-80">{PERIOD_DATA[period].label}</p>
        <p className="text-3xl font-bold mt-1">₹{PERIOD_DATA[period].total.toLocaleString()}</p>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Weekly Breakdown</h2>
        <div className="flex items-end gap-3 h-40">
          {weeklyEarnings.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-xs text-muted font-medium">₹{(d.amount / 1000).toFixed(1)}k</span>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(d.amount / maxEarning) * 100}%`,
                  background: 'var(--color-primary)',
                  opacity: 0.8,
                  minHeight: 4,
                }}
              />
              <span className="text-xs text-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Payout Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Total Earned</span>
            <span className="font-semibold text-primary">₹1,45,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Platform Fee (20%)</span>
            <span className="font-semibold text-primary">-₹29,000</span>
          </div>
          <div className="h-px bg-muted" />
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">Net Payout</span>
            <span className="font-bold text-brand">₹1,16,000</span>
          </div>
        </div>
        <button type="button" className="btn-base btn-primary text-sm mt-4 px-5 py-2 min-h-[44px]">
          Request Payout
        </button>
      </div>
    </div>
  )
}
