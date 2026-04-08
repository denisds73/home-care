import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { vendorService } from '../../services/vendorService'
import { CATEGORIES } from '../../data/categories'
import useStore from '../../store/useStore'
import type { CreateVendorPayload } from '../../types/domain'

const PHONE_RE = /^[6-9]\d{9}$/
const PIN_RE = /^\d{6}$/
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

interface FormState {
  company_name: string
  contact_number: string
  email: string
  city: string
  gst_number: string
  notes: string
}

const INITIAL: FormState = {
  company_name: '',
  contact_number: '',
  email: '',
  city: '',
  gst_number: '',
  notes: '',
}

export default function VendorCreatePage() {
  const navigate = useNavigate()
  const showToast = useStore((s) => s.showToast)

  const [form, setForm] = useState<FormState>(INITIAL)
  const [pinCodes, setPinCodes] = useState<string[]>([])
  const [pinDraft, setPinDraft] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'pin_codes' | 'category_ids', string>>>({})

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const addPin = () => {
    const pin = pinDraft.trim()
    if (!pin) return
    if (!PIN_RE.test(pin)) {
      showToast('PIN code must be 6 digits', 'warning')
      return
    }
    if (pinCodes.includes(pin)) {
      setPinDraft('')
      return
    }
    setPinCodes((list) => [...list, pin])
    setPinDraft('')
  }

  const removePin = (pin: string) =>
    setPinCodes((list) => list.filter((p) => p !== pin))

  const toggleCategory = (id: string) =>
    setCategoryIds((list) =>
      list.includes(id) ? list.filter((c) => c !== id) : [...list, id],
    )

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.company_name.trim() || form.company_name.length > 200)
      next.company_name = 'Company name is required (max 200 chars)'
    if (!PHONE_RE.test(form.contact_number))
      next.contact_number = 'Enter a valid 10-digit Indian mobile (starts with 6-9)'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Valid email required'
    if (!form.city.trim()) next.city = 'City is required'
    if (pinCodes.length === 0) next.pin_codes = 'At least one PIN code required'
    if (!GST_RE.test(form.gst_number.toUpperCase()))
      next.gst_number = 'Enter a valid 15-char GSTIN'
    if (categoryIds.length === 0)
      next.category_ids = 'Select at least one service category'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      showToast('Please fix the errors in the form', 'warning')
      return
    }
    const payload: CreateVendorPayload = {
      company_name: form.company_name.trim(),
      contact_number: form.contact_number.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      pin_codes: pinCodes,
      gst_number: form.gst_number.trim().toUpperCase(),
      category_ids: categoryIds,
      notes: form.notes.trim() || undefined,
    }
    try {
      setIsSaving(true)
      const vendor = await vendorService.create(payload)
      showToast('Vendor onboarded successfully', 'success')
      navigate(`/admin/vendors/${vendor.id}`)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to onboard vendor',
        'danger',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fade-in space-y-6 max-w-3xl">
      <div>
        <Link
          to="/admin/vendors"
          className="text-xs text-muted hover:text-primary"
        >
          ← Back to vendors
        </Link>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary mt-2">
          Onboard New Vendor
        </h1>
        <p className="text-muted text-sm mt-1">
          Register a business entity that will provide services on the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Business info */}
        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">Business Info</h2>

          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="company_name">
              Company Name
            </label>
            <input
              id="company_name"
              className={`input-base px-3 py-2 ${errors.company_name ? 'input-error' : ''}`}
              maxLength={200}
              value={form.company_name}
              onChange={(e) => setField('company_name', e.target.value)}
              required
            />
            {errors.company_name && (
              <span className="text-xs text-error">{errors.company_name}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="label-base" htmlFor="contact_number">
                Contact Number
              </label>
              <input
                id="contact_number"
                className={`input-base px-3 py-2 ${errors.contact_number ? 'input-error' : ''}`}
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={form.contact_number}
                onChange={(e) =>
                  setField(
                    'contact_number',
                    e.target.value.replace(/\D/g, ''),
                  )
                }
                required
              />
              {errors.contact_number && (
                <span className="text-xs text-error">
                  {errors.contact_number}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-base" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`input-base px-3 py-2 ${errors.email ? 'input-error' : ''}`}
                maxLength={255}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                required
              />
              {errors.email && (
                <span className="text-xs text-error">{errors.email}</span>
              )}
            </div>
          </div>
        </section>

        {/* Location / PIN Codes */}
        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">
            Service Coverage
          </h2>

          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="city">
              City
            </label>
            <input
              id="city"
              className={`input-base px-3 py-2 ${errors.city ? 'input-error' : ''}`}
              maxLength={100}
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              required
            />
            {errors.city && (
              <span className="text-xs text-error">{errors.city}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="label-base" htmlFor="pin_draft">
              PIN Codes
            </label>
            <div className="flex gap-2">
              <input
                id="pin_draft"
                className="input-base px-3 py-2 flex-1"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 560001"
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addPin()
                  }
                }}
              />
              <button
                type="button"
                onClick={addPin}
                className="btn-base btn-ghost text-xs px-4 py-2 min-h-[44px]"
              >
                Add
              </button>
            </div>
            {pinCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {pinCodes.map((pin) => (
                  <span
                    key={pin}
                    className="badge badge-confirmed flex items-center gap-1"
                  >
                    {pin}
                    <button
                      type="button"
                      onClick={() => removePin(pin)}
                      aria-label={`Remove PIN ${pin}`}
                      className="ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.pin_codes && (
              <span className="text-xs text-error">{errors.pin_codes}</span>
            )}
          </div>
        </section>

        {/* GST */}
        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">Tax Details</h2>
          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="gst_number">
              GST Number
            </label>
            <input
              id="gst_number"
              className={`input-base px-3 py-2 font-mono uppercase ${errors.gst_number ? 'input-error' : ''}`}
              maxLength={15}
              placeholder="22AAAAA0000A1Z5"
              value={form.gst_number}
              onChange={(e) => setField('gst_number', e.target.value.toUpperCase())}
              required
            />
            {errors.gst_number && (
              <span className="text-xs text-error">{errors.gst_number}</span>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-primary">
            Service Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const selected = categoryIds.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`btn-base text-xs px-4 py-1.5 min-h-[44px] ${
                    selected ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
          {errors.category_ids && (
            <span className="text-xs text-error">{errors.category_ids}</span>
          )}
        </section>

        {/* Notes */}
        <section className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-primary">
            Admin Notes (internal)
          </h2>
          <textarea
            className="input-base px-3 py-2 w-full min-h-[90px]"
            maxLength={2000}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Any context for internal reference..."
          />
        </section>

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Onboard Vendor'}
          </button>
          <Link
            to="/admin/vendors"
            className="btn-base btn-ghost text-sm px-5 py-2 min-h-[44px]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
