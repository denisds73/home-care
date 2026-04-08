import { memo, useState } from 'react'
import type { PaymentMethod, User } from '../../types/domain'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { PaymentFormModal } from './PaymentFormModal'
import { safeRandomId } from '../../utils/safeRandomId'

interface PaymentMethodsSectionProps {
  user: User
}

const brandLabel = (brand?: PaymentMethod['brand']): string => {
  if (!brand) return 'Card'
  return brand.toUpperCase()
}

export const PaymentMethodsSection = memo(
  ({ user }: PaymentMethodsSectionProps) => {
    const updateUser = useAuthStore((s) => s.updateUser)
    const showToast = useStore((s) => s.showToast)
    const [modalOpen, setModalOpen] = useState(false)

    const methods = user.paymentMethods ?? []

    const handleCreate = async (payload: Omit<PaymentMethod, 'id'>) => {
      const tempId = safeRandomId()
      const optimistic: PaymentMethod = { id: tempId, ...payload }
      const nextList = payload.isDefault
        ? [...methods.map((m) => ({ ...m, isDefault: false })), optimistic]
        : [...methods, optimistic]
      updateUser({ paymentMethods: nextList })
      setModalOpen(false)
      try {
        const created = await userService.createPaymentMethod(payload)
        const withReal = nextList.map((m) =>
          m.id === tempId ? created : m,
        )
        updateUser({ paymentMethods: withReal })
        showToast('Payment method added', 'success')
      } catch {
        showToast('Saved locally — backend pending', 'warning')
      }
    }

    const handleDelete = async (id: string) => {
      const next = methods.filter((m) => m.id !== id)
      updateUser({ paymentMethods: next })
      try {
        await userService.deletePaymentMethod(id)
        showToast('Payment method removed', 'success')
      } catch {
        showToast('Removed locally — backend pending', 'warning')
      }
    }

    return (
      <section className="fade-in" aria-labelledby="payments-heading">
        <div className="glass-card no-hover p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div>
              <h2
                id="payments-heading"
                className="font-brand text-lg font-semibold text-primary"
              >
                Payment Methods
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Saved cards and UPI for faster checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
            >
              + Add Method
            </button>
          </div>

          {methods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg
                className="w-12 h-12 text-muted mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="2" y="6" width="20" height="13" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <h3 className="font-brand text-base font-semibold text-primary">
                No payment methods yet
              </h3>
              <p className="text-muted text-xs mt-1 max-w-xs">
                Add a card or UPI for one-tap payments.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] mt-4"
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methods.map((m) => (
                <li
                  key={m.id}
                  className="rounded-2xl p-4 border border-default flex items-center justify-between gap-3"
                  style={{
                    background:
                      m.type === 'card'
                        ? 'linear-gradient(135deg, var(--color-primary-soft), var(--color-card))'
                        : 'linear-gradient(135deg, var(--color-accent-soft), var(--color-card))',
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.type === 'card' ? (
                        <span
                          className="badge"
                          style={{
                            background: 'var(--color-primary)',
                            color: 'var(--color-card)',
                          }}
                        >
                          {brandLabel(m.brand)}
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            background: 'var(--color-accent-strong)',
                            color: 'var(--color-card)',
                          }}
                        >
                          UPI
                        </span>
                      )}
                      {m.isDefault && (
                        <span className="badge badge-completed">Default</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-primary mt-2 truncate">
                      {m.label}
                    </p>
                    <p className="text-xs text-muted tabular-nums">
                      {m.type === 'card'
                        ? `•••• •••• •••• ${m.last4 ?? '••••'}`
                        : m.upiId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    aria-label="Delete payment method"
                    className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-error hover:bg-muted shrink-0"
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
                </li>
              ))}
            </ul>
          )}
        </div>

        <PaymentFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
        />
      </section>
    )
  },
)

PaymentMethodsSection.displayName = 'PaymentMethodsSection'
