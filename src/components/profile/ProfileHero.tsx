import { memo } from 'react'
import type { User } from '../../types/domain'

interface ProfileHeroProps {
  user: User
  bookingsCount: number
  addressesCount: number
  onEdit: () => void
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatMemberSince = (iso?: string): string => {
  if (!iso) return 'Today'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Today'
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export const ProfileHero = memo(
  ({ user, bookingsCount, addressesCount, onEdit }: ProfileHeroProps) => {
    const initials = getInitials(user.name || 'User')
    const memberLine = formatMemberSince(user.memberSince)

    return (
      <section
        className="glass-card no-hover slide-up relative overflow-hidden p-6 md:p-12"
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-card) 55%, var(--color-accent-soft) 100%)',
          animationDelay: '0ms',
        }}
        aria-labelledby="profile-hero-name"
      >
        {/* Layered gradient mesh — 3 blurred radial blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'var(--color-primary)', opacity: 0.18 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'var(--color-accent)', opacity: 0.22 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/3 w-56 h-56 rounded-full blur-3xl -translate-y-1/2"
          style={{ background: 'var(--color-primary)', opacity: 0.08 }}
        />
        {/* Subtle noise via repeating gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--color-text-primary) 0 1px, transparent 1px 3px)',
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div
              className="rounded-full p-[3px]"
              style={{
                background:
                  'conic-gradient(from 180deg, var(--color-primary), var(--color-accent), var(--color-primary))',
              }}
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center ring-4 ring-white shadow-xl"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: 'var(--color-card)',
                }}
                aria-label={`Avatar for ${user.name}`}
              >
                <span className="font-brand text-3xl font-bold tracking-tight">
                  {initials}
                </span>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full ring-2 ring-white"
              style={{ background: 'var(--color-accent)' }}
            />
          </div>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-accent-strong)' }}
            >
              Member Profile
            </p>
            <div
              aria-hidden="true"
              className="h-px w-12 my-2 mx-auto md:mx-0"
              style={{ background: 'var(--color-accent)' }}
            />
            <h1
              id="profile-hero-name"
              className="font-brand text-3xl md:text-4xl font-bold text-primary truncate leading-tight"
            >
              {user.name}
            </h1>
            <div className="mt-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-secondary">
              <span className="truncate">{user.email}</span>
              {user.phone && (
                <>
                  <span aria-hidden="true" className="hidden md:inline text-muted">·</span>
                  <span className="tabular-nums">{user.phone}</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              Member since <span className="text-secondary font-medium">{memberLine}</span>
            </p>
          </div>

          <div className="shrink-0 hidden md:block">
            <button
              type="button"
              onClick={onEdit}
              className="btn-base btn-primary text-sm px-5 py-2.5 min-h-[44px]"
              aria-label="Edit profile"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Editorial stat strip with gold dot separators */}
        <div
          className="relative mt-8 pt-6"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-around md:justify-start md:gap-10">
            <HeroStat label="Bookings" value={String(bookingsCount)} />
            <StatDivider />
            <HeroStat label="Addresses" value={String(addressesCount)} />
            <StatDivider />
            <HeroStat label="Wallet" value="—" />
          </div>
        </div>

        <div className="relative mt-6 md:hidden">
          <button
            type="button"
            onClick={onEdit}
            className="btn-base btn-primary text-sm w-full min-h-[44px]"
            aria-label="Edit profile"
          >
            Edit Profile
          </button>
        </div>
      </section>
    )
  },
)

ProfileHero.displayName = 'ProfileHero'

const StatDivider = memo(() => (
  <span
    aria-hidden="true"
    className="w-1.5 h-1.5 rounded-full shrink-0"
    style={{ background: 'var(--color-accent)' }}
  />
))
StatDivider.displayName = 'StatDivider'

interface HeroStatProps {
  label: string
  value: string
}
const HeroStat = memo(({ label, value }: HeroStatProps) => (
  <div className="text-center md:text-left">
    <p className="font-brand text-2xl md:text-3xl font-bold text-primary tabular-nums leading-none">
      {value}
    </p>
    <p className="text-[11px] text-muted mt-1.5 uppercase tracking-widest font-medium">
      {label}
    </p>
  </div>
))
HeroStat.displayName = 'HeroStat'
