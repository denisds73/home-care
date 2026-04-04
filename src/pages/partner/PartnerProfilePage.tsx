import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { partnerService } from '../../services/partnerService'
import { CATEGORIES } from '../../data/categories'
import type { CategoryId, Partner } from '../../types/domain'

export default function PartnerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const showToast = useStore((s) => s.showToast)

  const [profile, setProfile] = useState<Partner | null>(null)
  const [skills, setSkills] = useState<CategoryId[]>([])
  const [serviceArea, setServiceArea] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingOnline, setIsTogglingOnline] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await partnerService.getProfile()
        const data = res.data
        setProfile(data)
        setSkills(data.skills)
        setServiceArea(data.serviceArea)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const toggleSkill = (id: CategoryId) => {
    setSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await partnerService.updateProfile({
        skills,
        service_area: serviceArea,
      })
      setProfile(res.data)
      showToast('Profile updated', 'success')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile'
      showToast(message, 'danger')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleOnline = async () => {
    if (!profile) return
    setIsTogglingOnline(true)
    try {
      const res = await partnerService.toggleAvailability(!profile.isOnline)
      setProfile(res.data)
      showToast(
        res.data.isOnline ? 'You are now online' : 'You are now offline',
        'success',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update availability'
      showToast(message, 'danger')
    } finally {
      setIsTogglingOnline(false)
    }
  }

  if (error && !profile) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <p className="text-error text-sm mb-4">{error}</p>
        <button
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
            Profile
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage your skills and service details.
          </p>
        </div>
        <div className="glass-card p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="h-12 w-16 bg-muted rounded" />
            <div className="h-12 w-16 bg-muted rounded" />
            <div className="h-12 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="glass-card p-5 animate-pulse">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Profile
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage your skills and service details.
        </p>
      </div>

      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-soft flex items-center justify-center text-2xl font-bold text-brand">
              {(profile?.name ?? user?.name)?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="font-semibold text-primary text-lg">
                {profile?.name ?? user?.name}
              </p>
              <p className="text-sm text-muted">
                {profile?.email ?? user?.email}
              </p>
            </div>
          </div>
          {/* Online toggle */}
          <button
            type="button"
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
              profile?.isOnline
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-muted text-secondary border border-transparent'
            }`}
            aria-label={
              profile?.isOnline ? 'Go offline' : 'Go online'
            }
          >
            {isTogglingOnline
              ? 'Updating...'
              : profile?.isOnline
                ? 'Online'
                : 'Offline'}
          </button>
        </div>
        <div className="flex gap-6 text-center flex-wrap">
          <div>
            <p className="text-xl font-bold text-primary">
              {profile?.completedJobs ?? 0}
            </p>
            <p className="text-xs text-muted">Jobs Done</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">
              {profile?.rating?.toFixed(1) ?? '--'}
            </p>
            <p className="text-xs text-muted">Rating</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">
              {profile?.serviceArea ?? '--'}
            </p>
            <p className="text-xs text-muted">Service Area</p>
          </div>
        </div>
      </div>

      {/* Service categories */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-3">
          Service Categories
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleSkill(cat.id)}
              className={`p-3 rounded-lg text-sm font-medium text-left transition min-h-[44px] ${
                skills.includes(cat.id)
                  ? 'bg-brand-soft text-brand border-2 border-brand'
                  : 'bg-muted text-secondary border-2 border-transparent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service area */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-3">
          Service Area
        </h2>
        <input
          type="text"
          className="input-base w-full py-2.5 px-4 text-sm"
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="Enter service areas"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="btn-base btn-primary text-sm px-6 py-2.5 min-h-[44px]"
      >
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}
