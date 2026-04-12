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
    return () => {
      alive = false
    }
  }, [])

  const handleSave = async () => {
    if (!vendor) return
    setSaving(true)
    try {
      const updated = await vendorService.updateMe({
        contact_number: contactNumber.trim(),
        pin_codes: pinCodes
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      })
      setVendor(updated)
      showToast('Profile updated', 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update profile',
        'danger',
      )
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-48 bg-surface rounded mb-3" />
        <div className="h-3 w-64 bg-surface rounded" />
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
    <div className="fade-in space-y-5 max-w-2xl">
      <div className="glass-card p-5 space-y-4">
        <div>
          <h2 className="font-brand text-base font-bold text-primary">
            {vendor.company_name}
          </h2>
          <p className="text-xs text-muted mt-1">
            GSTIN {vendor.gst_number}
            {vendor.gst_verified ? ' · Verified' : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted text-xs">Email</p>
            <p className="text-secondary">{vendor.email}</p>
          </div>
          <div>
            <p className="text-muted text-xs">City</p>
            <p className="text-secondary">{vendor.city}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted text-xs">Categories</p>
            <p className="text-secondary">
              {vendor.categories.map((c) => c.name).join(', ') || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-brand text-base font-bold text-primary">
          Contact details
        </h3>
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
            Serviced PIN codes (comma separated)
          </label>
          <input
            id="pin-codes"
            type="text"
            value={pinCodes}
            onChange={(e) => setPinCodes(e.target.value)}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="560001, 560002"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
