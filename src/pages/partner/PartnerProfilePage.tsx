import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import type { CategoryId } from '../../types/domain'

export default function PartnerProfilePage() {
  const user = useAuthStore(s => s.user)
  const showToast = useStore(s => s.showToast)
  const [skills, setSkills] = useState<CategoryId[]>(['ac', 'refrigerator'])
  const [serviceArea, setServiceArea] = useState('Koramangala, HSR Layout')

  const toggleSkill = (id: CategoryId) => {
    setSkills(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]))
  }

  const handleSave = () => {
    showToast('Profile updated', 'success')
  }

  return (
    <div>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-soft flex items-center justify-center text-2xl font-bold text-brand">
            {user?.name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <p className="font-semibold text-primary text-lg">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-6 text-center flex-wrap">
          <div>
            <p className="text-xl font-bold text-primary">234</p>
            <p className="text-xs text-muted">Jobs Done</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">4.8</p>
            <p className="text-xs text-muted">Rating</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">11</p>
            <p className="text-xs text-muted">Months Active</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Service Categories</h2>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
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

      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Service Area</h2>
        <input
          type="text"
          className="input-base w-full py-2.5 px-4 text-sm"
          value={serviceArea}
          onChange={e => setServiceArea(e.target.value)}
          placeholder="Enter service areas"
        />
      </div>

      <button type="button" onClick={handleSave} className="btn-base btn-primary text-sm px-6 py-2.5 min-h-[44px]">
        Save Profile
      </button>
    </div>
  )
}
