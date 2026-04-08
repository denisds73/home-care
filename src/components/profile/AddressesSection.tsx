import { memo, useState } from 'react'
import type { Address, User } from '../../types/domain'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { AddressFormModal } from './AddressFormModal'
import { safeRandomId } from '../../utils/safeRandomId'

interface AddressesSectionProps {
  user: User
}

const normalizeDefaults = (list: Address[], defaultId?: string): Address[] =>
  list.map((a) => ({ ...a, isDefault: a.id === defaultId }))

export const AddressesSection = memo(({ user }: AddressesSectionProps) => {
  const updateUser = useAuthStore((s) => s.updateUser)
  const showToast = useStore((s) => s.showToast)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)

  const addresses = user.addresses ?? []

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (addr: Address) => {
    setEditing(addr)
    setModalOpen(true)
  }

  const handleSubmit = async (payload: Omit<Address, 'id'>) => {
    if (editing) {
      const updatedLocal: Address = { ...editing, ...payload }
      const nextList = addresses.map((a) =>
        a.id === editing.id ? updatedLocal : a,
      )
      const finalList = payload.isDefault
        ? normalizeDefaults(nextList, editing.id)
        : nextList
      updateUser({ addresses: finalList })
      setModalOpen(false)
      try {
        await userService.updateAddress(editing.id, payload)
        showToast('Address updated', 'success')
      } catch {
        showToast('Saved locally — backend pending', 'warning')
      }
    } else {
      const tempId = safeRandomId()
      const optimistic: Address = { id: tempId, ...payload }
      const nextList = [...addresses, optimistic]
      const finalList = payload.isDefault
        ? normalizeDefaults(nextList, tempId)
        : nextList
      updateUser({ addresses: finalList })
      setModalOpen(false)
      try {
        const created = await userService.createAddress(payload)
        const withReal = finalList.map((a) => (a.id === tempId ? created : a))
        updateUser({ addresses: withReal })
        showToast('Address added', 'success')
      } catch {
        showToast('Saved locally — backend pending', 'warning')
      }
    }
  }

  const handleDelete = async (id: string) => {
    const next = addresses.filter((a) => a.id !== id)
    updateUser({ addresses: next })
    try {
      await userService.deleteAddress(id)
      showToast('Address removed', 'success')
    } catch {
      showToast('Removed locally — backend pending', 'warning')
    }
  }

  const handleSetDefault = async (id: string) => {
    const next = normalizeDefaults(addresses, id)
    updateUser({ addresses: next })
    try {
      await userService.updateAddress(id, { isDefault: true })
      showToast('Default address updated', 'success')
    } catch {
      showToast('Saved locally — backend pending', 'warning')
    }
  }

  return (
    <section className="fade-in" aria-labelledby="addresses-heading">
      <div className="glass-card no-hover p-5 md:p-6">
        <div className="flex items-center justify-between mb-5 gap-3">
          <div>
            <h2
              id="addresses-heading"
              className="font-brand text-lg font-semibold text-primary"
            >
              Saved Addresses
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Your service locations.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              className="w-12 h-12 text-muted mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3 className="font-brand text-base font-semibold text-primary">
              No saved addresses yet
            </h3>
            <p className="text-muted text-xs mt-1 max-w-xs">
              Add your home or work address for faster bookings.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] mt-4"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="rounded-2xl border border-default p-4 bg-card flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="badge"
                      style={{
                        background: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="badge badge-completed">Default</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(addr)}
                      aria-label="Edit address"
                      className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-secondary hover:bg-muted"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      aria-label="Delete address"
                      className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-error hover:bg-muted"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-primary font-medium">
                  {addr.line1}
                </p>
                {addr.line2 && (
                  <p className="text-sm text-secondary">{addr.line2}</p>
                )}
                {addr.landmark && (
                  <p className="text-xs text-muted">Near {addr.landmark}</p>
                )}
                <p className="text-sm text-secondary">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-brand hover:underline self-start mt-1 min-h-[32px]"
                  >
                    Set as default
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddressFormModal
        isOpen={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  )
})

AddressesSection.displayName = 'AddressesSection'
