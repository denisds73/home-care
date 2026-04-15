import { memo, useState, useCallback } from 'react'
import Modal from '../common/Modal'
import type { Address, LocationData } from '../../types/domain'
import Dropdown from '../common/Dropdown'
import { PlacesAutocomplete } from '../maps'
import { ENV } from '../../config/env'

interface AddressFormModalProps {
  isOpen: boolean
  initial?: Address | null
  onClose: () => void
  onSubmit: (payload: Omit<Address, 'id'>) => void
}

type LabelType = Address['label']

interface FormState {
  label: LabelType
  line1: string
  line2: string
  landmark: string
  city: string
  state: string
  pincode: string
  lat?: number
  lng?: number
  isDefault: boolean
}

const EMPTY: FormState = {
  label: 'Home',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
}

export const AddressFormModal = memo(
  ({ isOpen, initial, onClose, onSubmit }: AddressFormModalProps) => {
    const [form, setForm] = useState<FormState>(EMPTY)
    const [touched, setTouched] = useState(false)
    const [lastOpenKey, setLastOpenKey] = useState<string | null>(null)

    const handlePlaceSelect = useCallback((location: LocationData) => {
      setForm((f) => ({
        ...f,
        line1: location.fullAddress,
        lat: location.lat,
        lng: location.lng,
      }))
    }, [])

    const openKey = isOpen ? (initial?.id ?? 'new') : null
    if (openKey !== null && openKey !== lastOpenKey) {
      setLastOpenKey(openKey)
      setForm(
        initial
          ? {
              label: initial.label,
              line1: initial.line1,
              line2: initial.line2 ?? '',
              landmark: initial.landmark ?? '',
              city: initial.city,
              state: initial.state,
              pincode: initial.pincode,
              lat: initial.lat,
              lng: initial.lng,
              isDefault: initial.isDefault,
            }
          : EMPTY,
      )
      setTouched(false)
    } else if (openKey === null && lastOpenKey !== null) {
      setLastOpenKey(null)
    }

    const errors = {
      line1: form.line1.trim().length < 3 ? 'Required' : '',
      city: form.city.trim().length < 2 ? 'Required' : '',
      state: form.state.trim().length < 2 ? 'Required' : '',
      pincode: /^\d{6}$/.test(form.pincode) ? '' : '6-digit pincode',
    }
    const hasErrors = Object.values(errors).some((e) => e.length > 0)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      setTouched(true)
      if (hasErrors) return
      onSubmit({
        label: form.label,
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        lat: form.lat,
        lng: form.lng,
        isDefault: form.isDefault,
      })
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-brand text-lg font-semibold text-primary">
              {initial ? 'Edit Address' : 'Add Address'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-secondary hover:bg-muted"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Dropdown
                options={[
                  { value: 'Home', label: 'Home' },
                  { value: 'Work', label: 'Work' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={form.label}
                onChange={(v) =>
                  setForm((f) => ({ ...f, label: v as LabelType }))
                }
                label="Label"
                id="addr-label"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="addr-line1"
                className="text-xs font-semibold text-secondary uppercase"
              >
                Address Line 1
              </label>
              {ENV.GOOGLE_PLACES_KEY ? (
                <PlacesAutocomplete
                  value={form.line1}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, line1: value }))
                  }
                  onSelect={handlePlaceSelect}
                  placeholder="Search for area, street name..."
                  error={touched && !!errors.line1}
                />
              ) : (
                <input
                  id="addr-line1"
                  type="text"
                  value={form.line1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, line1: e.target.value }))
                  }
                  maxLength={120}
                  className={`input-base w-full px-3 py-2.5 text-sm ${
                    touched && errors.line1 ? 'field-invalid' : ''
                  }`}
                />
              )}
              {touched && errors.line1 && (
                <span className="text-xs text-error">{errors.line1}</span>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="addr-line2"
                className="text-xs font-semibold text-secondary uppercase"
              >
                Address Line 2 (optional)
              </label>
              <input
                id="addr-line2"
                type="text"
                value={form.line2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, line2: e.target.value }))
                }
                maxLength={120}
                className="input-base w-full px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                htmlFor="addr-landmark"
                className="text-xs font-semibold text-secondary uppercase"
              >
                Landmark (optional)
              </label>
              <input
                id="addr-landmark"
                type="text"
                value={form.landmark}
                onChange={(e) =>
                  setForm((f) => ({ ...f, landmark: e.target.value }))
                }
                maxLength={80}
                className="input-base w-full px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="addr-city"
                className="text-xs font-semibold text-secondary uppercase"
              >
                City
              </label>
              <input
                id="addr-city"
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched && errors.city ? 'field-invalid' : ''
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="addr-state"
                className="text-xs font-semibold text-secondary uppercase"
              >
                State
              </label>
              <input
                id="addr-state"
                type="text"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched && errors.state ? 'field-invalid' : ''
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="addr-pincode"
                className="text-xs font-semibold text-secondary uppercase"
              >
                Pincode
              </label>
              <input
                id="addr-pincode"
                type="text"
                inputMode="numeric"
                value={form.pincode}
                maxLength={6}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pincode: e.target.value.replace(/\D/g, ''),
                  }))
                }
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched && errors.pincode ? 'field-invalid' : ''
                }`}
              />
              {touched && errors.pincode && (
                <span className="text-xs text-error">{errors.pincode}</span>
              )}
            </div>

            <label className="flex items-center gap-2 md:col-span-2 mt-1 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-secondary">
                Set as default address
              </span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]"
            >
              {initial ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </Modal>
    )
  },
)

AddressFormModal.displayName = 'AddressFormModal'
