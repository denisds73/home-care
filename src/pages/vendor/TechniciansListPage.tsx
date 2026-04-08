import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { technicianService } from '../../services/technicianService'
import useStore from '../../store/useStore'
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

export default function TechniciansListPage() {
  const showToast = useStore((s) => s.showToast)
  const [items, setItems] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const list = await technicianService.listMine()
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technicians')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async (t: Technician) => {
    const next: TechnicianStatus = t.status === 'active' ? 'inactive' : 'active'
    setBusyId(t.id)
    try {
      await technicianService.updateStatus(t.id, next)
      showToast(
        `Technician ${next === 'active' ? 'activated' : 'deactivated'}`,
        'success',
      )
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'danger',
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
            Technicians
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage your field team and their skills.
          </p>
        </div>
        <Link
          to="/vendor/technicians/new"
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          + Add technician
        </Link>
      </div>

      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={load}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="glass-card overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="h-4 w-32 bg-surface rounded" />
                  <div className="h-4 w-28 bg-surface rounded" />
                  <div className="h-4 w-40 bg-surface rounded" />
                  <div className="h-4 w-20 bg-surface rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted mb-4">
                You haven&apos;t added any technicians yet.
              </p>
              <Link
                to="/vendor/technicians/new"
                className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
              >
                Add your first technician
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted bg-surface">
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Skills</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-gray-50 hover:bg-surface/50"
                  >
                    <td className="p-3 font-medium">{t.full_name}</td>
                    <td className="p-3 text-muted">{t.phone}</td>
                    <td className="p-3 text-muted">{t.email}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {t.skills.length === 0 ? (
                          <span className="text-xs text-muted">—</span>
                        ) : (
                          t.skills.map((s) => (
                            <span key={s} className="badge">
                              {skillName(s)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`badge ${STATUS_BADGE[t.status]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/vendor/technicians/${t.id}`}
                          className="btn-base btn-ghost text-xs px-3 py-1 min-h-[36px]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleStatus(t)}
                          disabled={busyId === t.id}
                          className="btn-base btn-secondary text-xs px-3 py-1 min-h-[36px] disabled:opacity-60"
                        >
                          {t.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
