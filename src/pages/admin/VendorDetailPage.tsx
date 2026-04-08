import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Modal from '../../components/common/Modal'
import { vendorService } from '../../services/vendorService'
import { CATEGORIES } from '../../data/categories'
import useStore from '../../store/useStore'
import type {
  UpdateVendorPayload,
  Vendor,
  VendorStatus,
} from '../../types/domain'
import { vendorStatusBadgeClass } from '../../utils/vendorStatus'

const PHONE_RE = /^[6-9]\d{9}$/
const PIN_RE = /^\d{6}$/
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useStore((s) => s.showToast)

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'status'; status: VendorStatus; label: string }
    | { type: 'delete' }
    | null
  >(null)

  // editable fields (initialized when vendor loads)
  const [companyName, setCompanyName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [gstVerified, setGstVerified] = useState(false)
  const [pinCodes, setPinCodes] = useState<string[]>([])
  const [pinDraft, setPinDraft] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const hydrate = (v: Vendor) => {
    setVendor(v)
    setCompanyName(v.company_name)
    setContactNumber(v.contact_number)
    setEmail(v.email)
    setCity(v.city)
    setGstNumber(v.gst_number)
    setGstVerified(v.gst_verified)
    setPinCodes(v.pin_codes ?? [])
    setCategoryIds((v.categories ?? []).map((c) => c.id))
    setNotes(v.notes ?? '')
  }

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const v = await vendorService.get(id)
      hydrate(v)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

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

  const toggleCategory = (cid: string) =>
    setCategoryIds((list) =>
      list.includes(cid) ? list.filter((c) => c !== cid) : [...list, cid],
    )

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || !vendor) return

    if (!companyName.trim() || companyName.length > 200) {
      showToast('Company name is required (max 200)', 'warning')
      return
    }
    if (!PHONE_RE.test(contactNumber)) {
      showToast('Invalid Indian mobile number', 'warning')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Invalid email', 'warning')
      return
    }
    if (!city.trim()) {
      showToast('City is required', 'warning')
      return
    }
    if (pinCodes.length === 0) {
      showToast('At least one PIN code required', 'warning')
      return
    }
    if (!GST_RE.test(gstNumber.toUpperCase())) {
      showToast('Invalid GSTIN', 'warning')
      return
    }
    if (categoryIds.length === 0) {
      showToast('Select at least one category', 'warning')
      return
    }

    const payload: UpdateVendorPayload = {
      company_name: companyName.trim(),
      contact_number: contactNumber.trim(),
      email: email.trim(),
      city: city.trim(),
      pin_codes: pinCodes,
      gst_number: gstNumber.trim().toUpperCase(),
      gst_verified: gstVerified,
      category_ids: categoryIds,
      notes: notes.trim() || undefined,
    }

    try {
      setIsSaving(true)
      const updated = await vendorService.update(id, payload)
      hydrate(updated)
      showToast('Vendor updated', 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update vendor',
        'danger',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const applyStatus = async (status: VendorStatus) => {
    if (!id) return
    try {
      const updated = await vendorService.updateStatus(id, status)
      hydrate(updated)
      showToast(`Vendor ${status}`, status === 'active' ? 'success' : 'warning')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'danger',
      )
    } finally {
      setConfirmAction(null)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await vendorService.remove(id)
      showToast('Vendor deleted', 'success')
      navigate('/admin/vendors')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete vendor',
        'danger',
      )
      setConfirmAction(null)
    }
  }

  if (isLoading) {
    return (
      <div className="fade-in space-y-4">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-5 w-48 bg-surface rounded mb-3" />
          <div className="h-3 w-64 bg-surface rounded" />
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Vendor not found'}</p>
        <Link
          to="/admin/vendors"
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          Back to vendors
        </Link>
      </div>
    )
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
        <div className="flex items-start justify-between gap-3 flex-wrap mt-2">
          <div>
            <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
              {vendor.company_name}
            </h1>
            <p className="text-muted text-sm mt-1">
              Onboarded {new Date(vendor.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={vendorStatusBadgeClass(vendor.status)}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Status actions */}
      <div className="glass-card p-4 flex flex-wrap gap-2">
        {vendor.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={() =>
                setConfirmAction({
                  type: 'status',
                  status: 'active',
                  label: 'Approve this vendor',
                })
              }
              className="btn-base btn-primary text-xs px-4 py-1.5 min-h-[44px]"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() =>
                setConfirmAction({
                  type: 'status',
                  status: 'rejected',
                  label: 'Reject this vendor application',
                })
              }
              className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
            >
              Reject
            </button>
          </>
        )}
        {vendor.status === 'active' && (
          <button
            type="button"
            onClick={() =>
              setConfirmAction({
                type: 'status',
                status: 'suspended',
                label: 'Suspend this active vendor',
              })
            }
            className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
          >
            Suspend
          </button>
        )}
        {vendor.status === 'suspended' && (
          <button
            type="button"
            onClick={() =>
              setConfirmAction({
                type: 'status',
                status: 'active',
                label: 'Reactivate this vendor',
              })
            }
            className="btn-base btn-success text-xs px-4 py-1.5 min-h-[44px]"
          >
            Reactivate
          </button>
        )}
        {vendor.status === 'rejected' && (
          <button
            type="button"
            onClick={() =>
              setConfirmAction({
                type: 'status',
                status: 'pending',
                label: 'Move vendor back to pending',
              })
            }
            className="btn-base btn-ghost text-xs px-4 py-1.5 min-h-[44px]"
          >
            Move to Pending
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmAction({ type: 'delete' })}
          className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px] ml-auto"
        >
          Delete Vendor
        </button>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-5" noValidate>
        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">Business Info</h2>
          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="d_company">
              Company Name
            </label>
            <input
              id="d_company"
              className="input-base px-3 py-2"
              maxLength={200}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="label-base" htmlFor="d_phone">
                Contact Number
              </label>
              <input
                id="d_phone"
                className="input-base px-3 py-2"
                inputMode="numeric"
                maxLength={10}
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(e.target.value.replace(/\D/g, ''))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-base" htmlFor="d_email">
                Email
              </label>
              <input
                id="d_email"
                type="email"
                className="input-base px-3 py-2"
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">
            Service Coverage
          </h2>
          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="d_city">
              City
            </label>
            <input
              id="d_city"
              className="input-base px-3 py-2"
              maxLength={100}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="label-base" htmlFor="d_pin">
              PIN Codes
            </label>
            <div className="flex gap-2">
              <input
                id="d_pin"
                className="input-base px-3 py-2 flex-1"
                inputMode="numeric"
                maxLength={6}
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
          </div>
        </section>

        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-primary">Tax Details</h2>
          <div className="flex flex-col gap-1">
            <label className="label-base" htmlFor="d_gst">
              GST Number
            </label>
            <input
              id="d_gst"
              className="input-base px-3 py-2 font-mono uppercase"
              maxLength={15}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={gstVerified}
              onChange={(e) => setGstVerified(e.target.checked)}
            />
            GST Verified
          </label>
        </section>

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
        </section>

        <section className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-primary">
            Admin Notes (internal)
          </h2>
          <textarea
            className="input-base px-3 py-2 w-full min-h-[90px]"
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      <Modal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-primary">
            {confirmAction?.type === 'delete'
              ? 'Delete vendor?'
              : 'Confirm action'}
          </h3>
          <p className="text-sm text-muted">
            {confirmAction?.type === 'delete'
              ? 'This permanently removes the vendor and cannot be undone.'
              : confirmAction?.type === 'status'
                ? confirmAction.label
                : ''}
          </p>
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="btn-base btn-ghost text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!confirmAction) return
                if (confirmAction.type === 'delete') handleDelete()
                else applyStatus(confirmAction.status)
              }}
              className="btn-base btn-danger text-sm px-4 py-2 min-h-[44px]"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
