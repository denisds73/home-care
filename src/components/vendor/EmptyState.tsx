import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ListEmptyState } from '../common/ListEmptyState'

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
    <ListEmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        action ? (
          <Link
            to={action.to}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] inline-flex"
          >
            {action.label}
          </Link>
        ) : undefined
      }
    />
  )
})
