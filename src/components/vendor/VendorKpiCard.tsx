import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface VendorKpiCardProps {
  icon: ReactNode
  label: string
  value: string | number
  sub: string
  to: string
  accentBg: string
  accentColor: string
  index?: number
}

export const VendorKpiCard = memo(function VendorKpiCard({
  icon,
  label,
  value,
  sub,
  to,
  accentBg,
  accentColor,
  index = 0,
}: VendorKpiCardProps) {
  return (
    <Link
      to={to}
      className="stat-card hover:shadow-md transition-shadow slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex gap-3 items-start">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-[10px] shrink-0 ${accentBg} ${accentColor}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted text-xs font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="font-brand text-2xl font-bold text-primary mt-1">
            {value}
          </p>
          <p className="text-muted text-xs mt-1">{sub}</p>
        </div>
      </div>
    </Link>
  )
})
