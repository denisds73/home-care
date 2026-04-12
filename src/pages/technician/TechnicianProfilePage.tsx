import { useCallback, useEffect, useState } from 'react'
import { technicianService } from '../../services/technicianService'
import { useAuthStore } from '../../store/useAuthStore'
import { CATEGORIES } from '../../data/categories'
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

function skillName(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id
}

export default function TechnicianProfilePage() {
  const logout = useAuthStore((s) => s.logout)
  const [me, setMe] = useState<Technician | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const t = await technicianService.getMe()
      setMe(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-48 bg-surface rounded mb-3" />
        <div className="h-3 w-64 bg-surface rounded" />
      </div>
    )
  }

  if (error || !me) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Profile not found'}</p>
        <button
          type="button"
          onClick={load}
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="font-brand text-xl font-bold text-primary">My Profile</h1>
        <p className="text-muted text-sm mt-1">Your account details.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div>
          <p className="text-xs text-muted">Name</p>
          <p className="text-base font-medium text-secondary">{me.full_name}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted">Phone</p>
            <p className="text-sm text-secondary">{me.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Status</p>
            <span className={`badge ${STATUS_BADGE[me.status]}`}>
              {STATUS_LABEL[me.status]}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">Email</p>
          <p className="text-sm text-secondary break-all">{me.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {me.skills.length === 0 ? (
              <span className="text-xs text-muted">None set</span>
            ) : (
              me.skills.map((s) => (
                <span key={s} className="badge">
                  {skillName(s)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="btn-base btn-danger w-full py-3 text-sm font-semibold min-h-[48px]"
      >
        Sign out
      </button>
    </div>
  )
}
