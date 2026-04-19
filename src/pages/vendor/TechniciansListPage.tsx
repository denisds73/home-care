import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { technicianService } from '../../services/technicianService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { TechnicianCard, EmptyState } from '../../components/vendor'
import Tooltip from '../../components/common/Tooltip'
import { BanIcon, CheckCircleIcon, PencilIcon, UsersIcon } from '../../components/common/Icons'
import { adminRowIconAction } from '../../lib/adminRowIconActionStyles'
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
      setItems(await technicianService.listMine())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technicians')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (t: Technician) => {
    const next: TechnicianStatus = t.status === 'active' ? 'inactive' : 'active'
    setBusyId(t.id)
    try {
      await technicianService.updateStatus(t.id, next)
      showToast(`Technician ${next === 'active' ? 'activated' : 'deactivated'}`, 'success')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'danger')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
              Technicians
            </h1>
            <p className="text-muted text-sm mt-1">Manage your field team and their skills.</p>
          </div>
          {!isLoading && items.length > 0 && (
            <span className="badge badge-confirmed">{items.length}</span>
          )}
        </div>
        <Link to="/vendor/technicians/new" className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
          + Add technician
        </Link>
      </div>

      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={load} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">Retry</button>
        </div>
      )}

      {!error && isLoading && (
        <div className="glass-card no-hover p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="h-4 w-32 bg-surface rounded" />
              <div className="h-4 w-28 bg-surface rounded" />
              <div className="h-4 w-40 bg-surface rounded" />
              <div className="h-4 w-20 bg-surface rounded" />
            </div>
          ))}
        </div>
      )}

      {!error && !isLoading && items.length === 0 && (
        <EmptyState
          icon={<UsersIcon className="w-12 h-12" />}
          title="No technicians yet"
          description="Add your first technician to start dispatching jobs."
          action={{ label: 'Add your first technician', to: '/vendor/technicians/new' }}
        />
      )}

      {!error && !isLoading && items.length > 0 && (
        <>
          {/* Mobile: card grid */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((t) => (
              <TechnicianCard key={t.id} technician={t} onToggleStatus={toggleStatus} busyId={busyId} skillName={skillName} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="glass-card no-hover overflow-hidden hidden md:block">
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-default">
              <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide">Team Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Phone</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Skills</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((t) => (
                    <tr key={t.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">{t.full_name}</td>
                      <td className="px-4 py-3 text-muted">{t.phone}</td>
                      <td className="px-4 py-3 text-muted">{t.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.skills.length === 0 ? (
                            <span className="text-xs text-muted">—</span>
                          ) : (
                            t.skills.map((s) => (
                              <span key={s} className="badge badge-confirmed">{skillName(s)}</span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_BADGE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1 flex-wrap"
                          role="group"
                          aria-label={`Actions for ${t.full_name}`}
                        >
                          <Tooltip label="Edit technician">
                            <Link
                              to={`/vendor/technicians/${t.id}`}
                              className={adminRowIconAction.edit}
                              aria-label={`Edit ${t.full_name}`}
                            >
                              <PencilIcon className="w-5 h-5 shrink-0" aria-hidden />
                            </Link>
                          </Tooltip>
                          <Tooltip
                            label={
                              t.status === 'active'
                                ? 'Deactivate technician'
                                : 'Activate technician'
                            }
                          >
                            <button
                              type="button"
                              onClick={() => toggleStatus(t)}
                              disabled={busyId === t.id}
                              className={`${t.status === 'active' ? adminRowIconAction.restrict : adminRowIconAction.allow} disabled:opacity-60`}
                              aria-label={
                                t.status === 'active'
                                  ? `Deactivate ${t.full_name}`
                                  : `Activate ${t.full_name}`
                              }
                            >
                              {t.status === 'active' ? (
                                <BanIcon className="w-5 h-5 shrink-0" aria-hidden />
                              ) : (
                                <CheckCircleIcon className="w-5 h-5 shrink-0" aria-hidden />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
