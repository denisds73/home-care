import { memo, useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { userService } from '../../services/userService'
import useStore from '../../store/useStore'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ChangePasswordModal = memo(
  ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const showToast = useStore((s) => s.showToast)
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [touched, setTouched] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
      if (isOpen) {
        setCurrent('')
        setNext('')
        setConfirm('')
        setTouched(false)
        setSaving(false)
      }
    }, [isOpen])

    const errors = {
      current: current.length === 0 ? 'Required' : '',
      next: next.length < 8 ? 'Minimum 8 characters' : '',
      confirm: confirm !== next ? 'Passwords do not match' : '',
    }
    const hasErrors = Object.values(errors).some((e) => e.length > 0)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setTouched(true)
      if (hasErrors) return
      setSaving(true)
      try {
        await userService.changePassword({ current, next })
        showToast('Password updated', 'success')
        onClose()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not update password'
        showToast(message, 'danger')
      } finally {
        setSaving(false)
      }
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="p-5 md:p-6">
          <h3 className="font-brand text-lg font-semibold text-primary mb-4">
            Change Password
          </h3>
          <div className="flex flex-col gap-4">
            <PwdField
              id="pw-current"
              label="Current Password"
              value={current}
              onChange={setCurrent}
              error={touched ? errors.current : ''}
            />
            <PwdField
              id="pw-new"
              label="New Password"
              value={next}
              onChange={setNext}
              error={touched ? errors.next : ''}
            />
            <PwdField
              id="pw-confirm"
              label="Confirm New Password"
              value={confirm}
              onChange={setConfirm}
              error={touched ? errors.confirm : ''}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]"
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    )
  },
)

ChangePasswordModal.displayName = 'ChangePasswordModal'

interface PwdFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
}

const PwdField = memo(({ id, label, value, onChange, error }: PwdFieldProps) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-xs font-semibold text-secondary uppercase"
    >
      {label}
    </label>
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-base w-full px-3 py-2.5 text-sm ${
        error ? 'field-invalid' : ''
      }`}
    />
    {error && <span className="text-xs text-error">{error}</span>}
  </div>
))

PwdField.displayName = 'PwdField'
