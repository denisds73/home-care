import { memo, useState } from 'react'
import type { User } from '../../types/domain'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { PhoneVerifyModal } from './PhoneVerifyModal'

interface PersonalInfoSectionProps {
  user: User
}

type Gender = 'male' | 'female' | 'other'

interface FormState {
  name: string
  email: string
  phone: string
  dob: string
  gender: Gender | ''
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/

const toForm = (u: User): FormState => ({
  name: u.name ?? '',
  email: u.email ?? '',
  phone: u.phone ?? '',
  dob: u.dob ?? '',
  gender: (u.gender as Gender | undefined) ?? '',
})

export const PersonalInfoSection = memo(
  ({ user }: PersonalInfoSectionProps) => {
    const updateUser = useAuthStore((s) => s.updateUser)
    const showToast = useStore((s) => s.showToast)

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<FormState>(() => toForm(user))
    const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
      name: false,
      email: false,
      phone: false,
      dob: false,
      gender: false,
    })
    const [saving, setSaving] = useState(false)
    const [phoneModalOpen, setPhoneModalOpen] = useState(false)
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null)

    const errors = {
      name:
        form.name.trim().length < 2 || form.name.trim().length > 50
          ? 'Name must be 2–50 characters'
          : '',
      email:
        form.email.trim().length > 0 && !EMAIL_RE.test(form.email)
          ? 'Enter a valid email'
          : '',
      phone:
        form.phone && !PHONE_RE.test(form.phone)
          ? 'Enter a valid 10-digit Indian number'
          : '',
      dob: '',
      gender: '',
    }

    // Only block save on errors for fields the user has actually touched
    // or that contain content. This prevents a stale/empty field on the
    // persisted user from permanently disabling Save for an unrelated edit.
    const blockingErrors: Array<keyof FormState> = ['name', 'email', 'phone']
    const hasErrors = blockingErrors.some((k) => errors[k].length > 0)

    const normalized = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dob: form.dob,
      gender: form.gender,
    }
    const original = {
      name: (user.name ?? '').trim(),
      email: (user.email ?? '').trim(),
      phone: (user.phone ?? '').trim(),
      dob: user.dob ?? '',
      gender: (user.gender as Gender | undefined) ?? '',
    }
    const isDirty =
      normalized.name !== original.name ||
      normalized.email !== original.email ||
      normalized.phone !== original.phone ||
      normalized.dob !== original.dob ||
      normalized.gender !== original.gender
    const phoneChanged = normalized.phone !== original.phone

    const handleChange = <K extends keyof FormState>(
      key: K,
      value: FormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleBlur = (key: keyof FormState) => {
      setTouched((prev) => ({ ...prev, [key]: true }))
    }

    const handleCancel = () => {
      setForm(toForm(user))
      setTouched({
        name: false,
        email: false,
        phone: false,
        dob: false,
        gender: false,
      })
      setEditing(false)
    }

    const persist = async () => {
      const payload: Partial<User> = {
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone || undefined,
        dob: normalized.dob || undefined,
        gender: normalized.gender || undefined,
      }
      setSaving(true)
      try {
        const updated = await userService.updateProfile(payload)
        updateUser(payload)
        if (updated && typeof updated === 'object') {
          updateUser(updated)
        }
        showToast('Profile updated', 'success')
        setEditing(false)
        setVerifiedPhone(null)
      } catch {
        updateUser(payload)
        showToast('Saved locally — backend pending', 'warning')
        setEditing(false)
        setVerifiedPhone(null)
      } finally {
        setSaving(false)
      }
    }

    const handleSave = async () => {
      setTouched({
        name: true,
        email: true,
        phone: true,
        dob: true,
        gender: true,
      })
      if (hasErrors) return
      if (!isDirty) {
        showToast('No changes to save', 'info')
        return
      }
      // Phone changes require OTP verification first
      if (phoneChanged && normalized.phone && verifiedPhone !== normalized.phone) {
        setPhoneModalOpen(true)
        return
      }
      await persist()
    }

    const handlePhoneVerified = async (phone: string) => {
      setVerifiedPhone(phone)
      setPhoneModalOpen(false)
      await persist()
    }

    return (
      <section
        className="glass-card no-hover p-5 md:p-6"
        aria-labelledby="personal-info-heading"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2
              id="personal-info-heading"
              className="font-brand text-lg font-semibold text-primary"
            >
              Personal Information
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Keep your details up to date.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
              aria-label="Edit personal information"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || hasErrors || !isDirty}
                className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone ?? '—'} />
            <InfoRow label="Date of Birth" value={user.dob ?? '—'} />
            <InfoRow
              label="Gender"
              value={user.gender ? capitalize(user.gender) : '—'}
            />
          </dl>
        ) : (
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <Field
              id="pf-name"
              label="Full Name"
              error={touched.name ? errors.name : ''}
            >
              <input
                id="pf-name"
                type="text"
                value={form.name}
                maxLength={50}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched.name && errors.name ? 'field-invalid' : ''
                }`}
              />
            </Field>
            <Field
              id="pf-email"
              label="Email"
              error={touched.email ? errors.email : ''}
            >
              <input
                id="pf-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched.email && errors.email ? 'field-invalid' : ''
                }`}
              />
            </Field>
            <Field
              id="pf-phone"
              label="Phone"
              error={touched.phone ? errors.phone : ''}
            >
              <input
                id="pf-phone"
                type="tel"
                value={form.phone}
                maxLength={10}
                placeholder="10-digit mobile"
                onChange={(e) =>
                  handleChange('phone', e.target.value.replace(/\D/g, ''))
                }
                onBlur={() => handleBlur('phone')}
                className={`input-base w-full px-3 py-2.5 text-sm ${
                  touched.phone && errors.phone ? 'field-invalid' : ''
                }`}
              />
            </Field>
            <Field id="pf-dob" label="Date of Birth">
              <input
                id="pf-dob"
                type="date"
                value={form.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="input-base w-full px-3 py-2.5 text-sm"
              />
            </Field>
            <Field id="pf-gender" label="Gender">
              <select
                id="pf-gender"
                value={form.gender}
                onChange={(e) =>
                  handleChange('gender', e.target.value as Gender | '')
                }
                className="input-base w-full px-3 py-2.5 text-sm"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </form>
        )}

        <PhoneVerifyModal
          isOpen={phoneModalOpen}
          phone={normalized.phone}
          onClose={() => setPhoneModalOpen(false)}
          onVerified={handlePhoneVerified}
        />
      </section>
    )
  },
)

PersonalInfoSection.displayName = 'PersonalInfoSection'

const capitalize = (s: string): string =>
  s ? s[0].toUpperCase() + s.slice(1) : s

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = memo(({ label, value }: InfoRowProps) => (
  <div>
    <dt className="text-xs font-medium text-muted uppercase tracking-wide">
      {label}
    </dt>
    <dd className="text-sm text-primary mt-1 font-medium break-words">
      {value}
    </dd>
  </div>
))

InfoRow.displayName = 'InfoRow'

interface FieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

const Field = memo(({ id, label, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-xs font-semibold text-secondary uppercase tracking-wide"
    >
      {label}
    </label>
    {children}
    {error && <span className="text-xs text-error fade-in">{error}</span>}
  </div>
))

Field.displayName = 'Field'
