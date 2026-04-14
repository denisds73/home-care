import { useEffect, useState } from 'react'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import type { Vendor } from '../../types/domain'

export default function VendorProfilePage() {
  const showToast = useStore((s) => s.showToast)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactNumber, setContactNumber] = useState('')
  const [pinCodes, setPinCodes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const v = await vendorService.getMe()
        if (!alive) return
        setVendor(v)
        setContactNumber(v.contact_number)
        setPinCodes(v.pin_codes.join(', '))
      } catch (err) {
        if (alive)
          setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        if (alive) setIsLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const handleSave = async () => {
    if (!vendor) return
    setSaving(true)
    try {
      const updated = await vendorService.updateMe({
        contact_number: contactNumber.trim(),
        pin_codes: pinCodes.split(',').map((p) => p.trim()).filter(Boolean),
      })
      setVendor(updated)
      showToast('Profile updated', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6 fade-in">
        <div className="glass-card no-hover p-6 animate-pulse">
          <div className="h-6 w-48 bg-surface rounded mb-3" />
          <div className="h-3 w-64 bg-surface rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><div className="h-3 w-16 bg-surface rounded mb-1" /><div className="h-4 w-36 bg-surface rounded" /></div>
            ))}
          </div>
        </div>
        <div className="glass-card no-hover p-6 animate-pulse">
          <div className="h-5 w-32 bg-surface rounded mb-4" />
          <div className="space-y-3"><div className="h-10 w-full bg-surface rounded" /><div className="h-10 w-full bg-surface rounded" /></div>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm">{error ?? 'Vendor profile not found'}</p>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6 max-w-2xl">
      {/* Company Info */}
      <div className="glass-card no-hover p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-brand text-xl font-bold text-primary">
              {vendor.company_name}
            </h2>
            <p className="text-xs text-muted mt-1 flex items-center gap-2">
              GSTIN {vendor.gst_number}
              {vendor.gst_verified && (
                <span className="badge badge-success">Verified</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Email</p>
            <p className="text-sm text-primary font-medium mt-0.5">{vendor.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">City</p>
            <p className="text-sm text-primary font-medium mt-0.5">{vendor.city}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Categories</p>
            {vendor.categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {vendor.categories.map((c) => (
                  <span key={c.id} className="badge badge-confirmed">{c.name}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted mt-0.5">No categories assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details Form */}
      <div className="glass-card no-hover overflow-hidden">
        <div className="p-5 md:px-6 md:py-4 border-b border-default">
          <h3 className="font-brand text-sm font-bold text-primary uppercase tracking-wide">
            Contact Details
          </h3>
        </div>
        <div className="p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="contact-number" className="label-base">
              Contact number
            </label>
            <input
              id="contact-number"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              maxLength={15}
              className="input-base w-full px-3 py-2 text-sm"
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="pin-codes" className="label-base">
              Serviced PIN codes
            </label>
            <input
              id="pin-codes"
              type="text"
              value={pinCodes}
              onChange={(e) => setPinCodes(e.target.value)}
              className="input-base w-full px-3 py-2 text-sm"
              placeholder="560001, 560002"
            />
            <p className="text-xs text-muted mt-1">Enter comma-separated PIN codes for your service area</p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-base btn-success text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
