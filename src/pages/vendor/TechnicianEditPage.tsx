import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { technicianService } from '../../services/technicianService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import type { CategoryId, Technician, TechnicianStatus } from '../../types/domain'

interface FormState {
  full_name: string
  phone: string
  email: string
  skills: CategoryId[]
  status: TechnicianStatus
}

export default function TechnicianEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useStore((s) => s.showToast)

  const [loaded, setLoaded] = useState<Technician | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const t = await technicianService.get(id)
      setLoaded(t)
      setForm({ full_name: t.full_name, phone: t.phone, email: t.email, skills: t.skills, status: t.status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technician')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const toggleSkill = (skill: CategoryId) => {
    setForm((prev) => prev ? { ...prev, skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill] } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !form || submitting) return
    setSubmitting(true)
    try {
      await technicianService.update(id, {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        skills: form.skills,
        status: form.status,
      })
      showToast('Technician updated', 'success')
      navigate('/vendor/technicians')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update technician', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Remove this technician? This cannot be undone.')) return
    setDeleting(true)
    try {
      await technicianService.remove(id)
      showToast('Technician removed', 'success')
      navigate('/vendor/technicians')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove technician', 'danger')
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4 fade-in">
        <div className="glass-card no-hover p-6 animate-pulse">
          <div className="h-5 w-48 bg-surface rounded mb-3" />
          <div className="h-3 w-64 bg-surface rounded mb-4" />
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-surface rounded" />)}</div>
        </div>
      </div>
    )
  }

  if (error || !loaded || !form) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Technician not found'}</p>
        <Link to="/vendor/technicians" className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">Back to technicians</Link>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-5 max-w-2xl">
      <Link to="/vendor/technicians" className="btn-base btn-ghost text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1">
        ← Back to technicians
      </Link>

      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Edit technician</h1>
        <p className="text-muted text-sm mt-1">{loaded.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card no-hover overflow-hidden" noValidate>
        {/* Personal Details */}
        <div className="p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-brand font-bold text-primary pb-2 border-b border-default">Personal Details</h3>
          <div className="flex flex-col gap-1">
            <label htmlFor="full_name" className="label-base">Full name</label>
            <input id="full_name" type="text" value={form.full_name} onChange={(e) => setForm((f) => f ? { ...f, full_name: e.target.value } : f)} maxLength={100} required className="input-base w-full px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="label-base">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => f ? { ...f, phone: e.target.value.replace(/\D/g, '') } : f)} maxLength={10} required inputMode="numeric" className="input-base w-full px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="label-base">Email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => f ? { ...f, email: e.target.value } : f)} maxLength={150} required className="input-base w-full px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Skills & Status */}
        <div className="p-5 md:p-6 space-y-4 border-t border-default">
          <h3 className="text-sm font-brand font-bold text-primary pb-2 border-b border-default">Skills & Status</h3>
          <div className="flex flex-col gap-2">
            <span className="label-base">Skills</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = form.skills.includes(c.id)
                return (
                  <button key={c.id} type="button" onClick={() => toggleSkill(c.id)} aria-pressed={active} className={`badge min-h-[40px] px-4 transition-all cursor-pointer ${active ? 'badge-success' : ''}`}>
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <label htmlFor="status" className="label-base">Status</label>
            <select id="status" value={form.status} onChange={(e) => setForm((f) => f ? { ...f, status: e.target.value as TechnicianStatus } : f)} className="input-base w-full px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 md:p-6 border-t border-default flex gap-3">
          <button type="submit" disabled={submitting} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
          <Link to="/vendor/technicians" className="btn-base btn-ghost text-sm px-5 py-2 min-h-[44px]">Cancel</Link>
        </div>
      </form>

      {/* Danger Zone — isolated from main form */}
      <div className="glass-card no-hover p-5 border border-error/20">
        <h3 className="text-sm font-brand font-bold text-error mb-2">Danger Zone</h3>
        <p className="text-xs text-muted mb-3">Removing a technician is permanent and cannot be undone.</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
        >
          {deleting ? 'Removing…' : 'Remove technician'}
        </button>
      </div>
    </div>
  )
}
