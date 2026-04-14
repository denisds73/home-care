import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { technicianService } from '../../services/technicianService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import Dropdown from '../../components/common/Dropdown'
import type { CategoryId, TechnicianStatus } from '../../types/domain'

const TECHNICIAN_STATUS_OPTIONS: { value: TechnicianStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On leave' },
]

interface FormState {
  full_name: string
  phone: string
  email: string
  password: string
  skills: CategoryId[]
  status: TechnicianStatus
}

const INITIAL: FormState = {
  full_name: '',
  phone: '',
  email: '',
  password: '',
  skills: [],
  status: 'active',
}

export default function TechnicianCreatePage() {
  const navigate = useNavigate()
  const showToast = useStore((s) => s.showToast)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)

  const toggleSkill = (id: CategoryId) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }))
  }

  const isValid =
    form.full_name.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(form.phone) &&
    /.+@.+\..+/.test(form.email) &&
    form.password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await technicianService.create({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        skills: form.skills,
        status: form.status,
      })
      showToast('Technician added', 'success')
      navigate('/vendor/technicians')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create technician', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fade-in space-y-5 max-w-2xl">
      <Link to="/vendor/technicians" className="btn-base btn-ghost text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1">
        ← Back to technicians
      </Link>

      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Add technician</h1>
        <p className="text-muted text-sm mt-1">Create an account so they can sign in to the technician app.</p>
      </div>

      <div className="glass-card no-hover p-4 stat-border-warning">
        <p className="text-sm text-secondary">
          <strong className="text-primary">Heads up:</strong> share these credentials with the technician. The password won&apos;t be shown again.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card no-hover overflow-hidden" noValidate>
        {/* Personal Details */}
        <div className="p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-brand font-bold text-primary pb-2 border-b border-default">Personal Details</h3>
          <div className="flex flex-col gap-1">
            <label htmlFor="full_name" className="label-base">Full name</label>
            <input id="full_name" type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} maxLength={100} required className="input-base w-full px-3 py-2 text-sm" placeholder="Rahul Sharma" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="label-base">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} maxLength={10} required inputMode="numeric" className="input-base w-full px-3 py-2 text-sm" placeholder="98xxxxxxxx" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="label-base">Email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} maxLength={150} required autoComplete="off" className="input-base w-full px-3 py-2 text-sm" placeholder="rahul@example.com" />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="p-5 md:p-6 space-y-4 border-t border-default">
          <h3 className="text-sm font-brand font-bold text-primary pb-2 border-b border-default">Credentials</h3>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="label-base">Temporary password</label>
            <input id="password" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} minLength={8} maxLength={72} required autoComplete="off" className="input-base w-full px-3 py-2 text-sm" placeholder="At least 8 characters" />
            <p className="text-xs text-muted">Technician can change this after first login.</p>
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
            <Dropdown
              id="status"
              options={TECHNICIAN_STATUS_OPTIONS}
              value={form.status}
              onChange={(v) =>
                setForm((f) => ({ ...f, status: v as TechnicianStatus }))
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 md:p-6 border-t border-default flex gap-3">
          <button type="submit" disabled={!isValid || submitting} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create technician'}
          </button>
          <Link to="/vendor/technicians" className="btn-base btn-ghost text-sm px-5 py-2 min-h-[44px]">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
