import { memo, type ReactNode } from 'react'

export type ListEmptyStateVariant = 'panel' | 'embedded'

export interface ListEmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  variant?: ListEmptyStateVariant
  className?: string
}

export const ListEmptyState = memo(function ListEmptyState({
  icon,
  title,
  description,
  action,
  variant = 'panel',
  className = '',
}: ListEmptyStateProps) {
  const shell =
    variant === 'panel'
      ? 'glass-card no-hover p-10 text-center fade-in'
      : 'py-10 px-4 text-center'

  return (
    <div
      className={[shell, className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 text-muted mx-auto mb-4 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full">
        {icon}
      </div>
      <h3 className="font-brand text-base font-bold text-primary">{title}</h3>
      <p className="text-sm text-muted mt-2 max-w-sm mx-auto">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
})
