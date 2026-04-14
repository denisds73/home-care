import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { CategoryId, Technician, TechnicianStatus } from '../../types/domain'

const STATUS_LABEL: Record<TechnicianStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On leave',
}

const STATUS_BADGE: Record<TechnicianStatus, string> = {
  active: 'badge-success',
  inactive: 'badge-error',
  on_leave: 'badge-warning',
}

interface TechnicianCardProps {
  technician: Technician
  onToggleStatus: (t: Technician) => void
  busyId: string | null
  skillName: (id: CategoryId) => string
}

export const TechnicianCard = memo(function TechnicianCard({
  technician: t,
  onToggleStatus,
  busyId,
  skillName,
}: TechnicianCardProps) {
  return (
    <div className="glass-card p-4 slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-brand text-sm font-bold text-primary">{t.full_name}</p>
          <p className="text-xs text-muted mt-1">{t.phone}</p>
          <p className="text-xs text-muted truncate">{t.email}</p>
        </div>
        <span className={`badge ${STATUS_BADGE[t.status]}`}>
          {STATUS_LABEL[t.status]}
        </span>
      </div>
      {t.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {t.skills.map((s) => (
            <span key={s} className="badge badge-confirmed">
              {skillName(s)}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-3 pt-3 border-t border-default">
        <Link
          to={`/vendor/technicians/${t.id}`}
          className="btn-base btn-ghost text-xs px-3 py-1.5 min-h-[40px]"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onToggleStatus(t)}
          disabled={busyId === t.id}
          className="btn-base btn-secondary text-xs px-3 py-1.5 min-h-[40px] disabled:opacity-60"
        >
          {t.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
})
