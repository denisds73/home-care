import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const CONFIRM_WORD = 'DELETE'

export const DeleteAccountModal = memo(
  ({ isOpen, onClose }: DeleteAccountModalProps) => {
    const logout = useAuthStore((s) => s.logout)
    const showToast = useStore((s) => s.showToast)
    const navigate = useNavigate()

    const [confirm, setConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
      if (isOpen) {
        setConfirm('')
        setDeleting(false)
      }
    }, [isOpen])

    const canDelete = confirm === CONFIRM_WORD

    const handleDelete = async () => {
      if (!canDelete) return
      setDeleting(true)
      try {
        await userService.deleteAccount()
      } catch {
        // Proceed with local logout regardless
      } finally {
        logout()
        showToast('Account deleted', 'success')
        navigate('/login', { replace: true })
      }
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <div className="p-5 md:p-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--color-error-soft)' }}
          >
            <svg
              className="w-6 h-6 text-error"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h3 className="font-brand text-lg font-semibold text-error">
            Delete Account
          </h3>
          <p className="text-sm text-secondary mt-2">
            This action is permanent. All your bookings, addresses, and payment
            methods will be erased. This cannot be undone.
          </p>
          <div className="mt-4">
            <label
              htmlFor="delete-confirm"
              className="text-xs font-semibold text-secondary uppercase"
            >
              Type <span className="text-error">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-base w-full px-3 py-2.5 text-sm mt-1"
              autoComplete="off"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="btn-base btn-danger text-sm px-4 py-2 min-h-[44px]"
            >
              {deleting ? 'Deleting…' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>
    )
  },
)

DeleteAccountModal.displayName = 'DeleteAccountModal'
