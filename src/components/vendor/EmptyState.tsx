import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; to: string }
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="glass-card no-hover p-10 text-center fade-in">
      <div className="w-12 h-12 text-muted mx-auto mb-4">{icon}</div>
      <h3 className="font-brand text-base font-bold text-primary">{title}</h3>
      <p className="text-sm text-muted mt-2 max-w-sm mx-auto">{description}</p>
      {action && (
        <Link
          to={action.to}
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] mt-5 inline-flex"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
})
