import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import Modal from '../../components/common/Modal'
import Dropdown from '../../components/common/Dropdown'
import type { CategoryId, Offer } from '../../types/domain'

const GRADIENT_PRESETS = [
  { label: 'Purple', value: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)' },
  { label: 'Dark Indigo', value: 'linear-gradient(135deg, #111827 0%, #4C1D95 100%)' },
  { label: 'Indigo Gold', value: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 62%, #A16207 130%)' },
  { label: 'Emerald', value: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)' },
  { label: 'Blue', value: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #9F1239 0%, #FB7185 100%)' },
]

interface OfferForm {
  title: string
  description: string
  tag: string
  cta_text: string
  category: CategoryId | ''
  image_url: string
  bg_gradient: string
  is_active: boolean
  sort_order: string
}

const EMPTY_FORM: OfferForm = {
  title: '',
  description: '',
  tag: '',
  cta_text: 'Book Now',
  category: '',
  image_url: '',
  bg_gradient: GRADIENT_PRESETS[0].value,
  is_active: true,
  sort_order: '0',
}

export default function OffersManagementPage() {
  const showToast = useStore(s => s.showToast)

  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await adminService.getOffers()
      setOffers(result.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const sorted = [...offers].sort((a, b) => a.sort_order - b.sort_order)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setModalMode('add')
  }

  const openEdit = (offer: Offer) => {
    setForm({
      title: offer.title,
      description: offer.description,
      tag: offer.tag,
      cta_text: offer.cta_text,
      category: offer.category,
      image_url: offer.image_url,
      bg_gradient: offer.bg_gradient,
      is_active: offer.is_active,
      sort_order: String(offer.sort_order),
    })
    setEditingId(offer.id)
    setModalMode('edit')
  }

  const handleSave = async () => {
    if (!form.title || !form.category || !form.tag) {
      showToast('Please fill required fields (title, category, tag)', 'warning')
      return
    }
    const payload: Partial<Offer> = {
      title: form.title,
      description: form.description,
      tag: form.tag,
      cta_text: form.cta_text || 'Book Now',
      category: form.category as CategoryId,
      image_url: form.image_url,
      bg_gradient: form.bg_gradient,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    }
    try {
      setIsSaving(true)
      if (modalMode === 'add') {
        await adminService.addOffer(payload)
        showToast('Offer added', 'success')
      } else if (editingId) {
        await adminService.updateOffer(editingId, payload)
        showToast('Offer updated', 'success')
      }
      setModalMode(null)
      await loadOffers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save offer', 'danger')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminService.deleteOffer(deleteId)
      showToast('Offer deleted', 'success')
      setDeleteId(null)
      await loadOffers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete offer', 'danger')
    }
  }

  const handleToggleActive = async (offer: Offer) => {
    try {
      await adminService.updateOffer(offer.id, { is_active: !offer.is_active })
      showToast(`Offer ${offer.is_active ? 'disabled' : 'enabled'}`, 'success')
      await loadOffers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update offer', 'danger')
    }
  }

  if (error && offers.length === 0) {
    return (
      <div className="fade-in space-y-6">
        <div className="glass-card p-8 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadOffers} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted">{offers.filter(o => o.is_active).length} active / {offers.length} total</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]">
          + Add Offer
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse">
              <div className="h-24 bg-surface rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 bg-surface rounded" />
                <div className="h-3 w-16 bg-surface rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-muted">No offers yet. Add your first offer to display on the home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map(offer => (
            <div
              key={offer.id}
              className={`glass-card overflow-hidden ${!offer.is_active ? 'opacity-50' : ''}`}
            >
              <div
                className="px-5 py-4 flex items-center gap-4"
                style={{ background: offer.bg_gradient }}
              >
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white mb-1">
                    {offer.tag}
                  </span>
                  <p className="text-sm font-bold text-white truncate">{offer.title}</p>
                  <p className="text-xs text-white/70 truncate">{offer.description}</p>
                </div>
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>
              <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted">
                  {CATEGORIES.find(c => c.id === offer.category)?.name ?? offer.category}
                </span>
                <span className="text-xs text-muted">·</span>
                <span className="text-xs text-muted">Order: {offer.sort_order}</span>
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" onClick={() => openEdit(offer)} className="text-xs text-brand font-semibold min-h-[44px] px-2">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleToggleActive(offer)} className="text-xs text-secondary font-semibold min-h-[44px] px-2">
                    {offer.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => setDeleteId(offer.id)} className="text-xs text-error font-semibold min-h-[44px] px-2">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalMode !== null} onClose={() => setModalMode(null)} maxWidth="max-w-xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">
            {modalMode === 'add' ? 'Add Offer' : 'Edit Offer'}
          </h3>

          <div className="space-y-3">
            <div>
              <label htmlFor="offer-title" className="text-xs font-semibold text-secondary mb-1 block">Title *</label>
              <input
                id="offer-title"
                type="text"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="e.g. 20% Off AC Services"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={60}
              />
            </div>

            <div>
              <label htmlFor="offer-desc" className="text-xs font-semibold text-secondary mb-1 block">Description</label>
              <input
                id="offer-desc"
                type="text"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="e.g. Deep cleaning, gas refill & installation"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-tag" className="text-xs font-semibold text-secondary mb-1 block">Tag *</label>
                <input
                  id="offer-tag"
                  type="text"
                  className="input-base w-full text-sm px-3 py-2"
                  placeholder="e.g. Limited Time"
                  value={form.tag}
                  onChange={e => setForm({ ...form, tag: e.target.value })}
                  maxLength={20}
                />
              </div>
              <div>
                <label htmlFor="offer-cta" className="text-xs font-semibold text-secondary mb-1 block">Button Text</label>
                <input
                  id="offer-cta"
                  type="text"
                  className="input-base w-full text-sm px-3 py-2"
                  placeholder="Book Now"
                  value={form.cta_text}
                  onChange={e => setForm({ ...form, cta_text: e.target.value })}
                  maxLength={20}
                />
              </div>
            </div>

            <Dropdown
              options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
              value={form.category}
              onChange={v => setForm({ ...form, category: v as CategoryId })}
              placeholder="Select Category"
              label="Category *"
              searchable
              searchPlaceholder="Search category..."
              id="offer-category"
            />

            <div>
              <label htmlFor="offer-image" className="text-xs font-semibold text-secondary mb-1 block">Image URL</label>
              <input
                id="offer-image"
                type="text"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="https://..."
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover mt-1"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>

            <div>
              <Dropdown
                options={GRADIENT_PRESETS.map(g => ({ value: g.value, label: g.label }))}
                value={form.bg_gradient}
                onChange={v => setForm({ ...form, bg_gradient: v })}
                placeholder="Select gradient"
                label="Background Gradient"
                id="offer-gradient"
              />
              <div
                className="h-6 rounded-md mt-1"
                style={{ background: form.bg_gradient }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-sort" className="text-xs font-semibold text-secondary mb-1 block">Sort Order</label>
                <input
                  id="offer-sort"
                  type="number"
                  className="input-base w-full text-sm px-3 py-2"
                  placeholder="0"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-secondary">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
            >
              {isSaving ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save'}
            </button>
            <button type="button" onClick={() => setModalMode(null)} className="btn-base btn-secondary text-sm px-5 py-2 min-h-[44px]">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-primary mb-2">Delete Offer?</h3>
          <p className="text-sm text-secondary mb-4">This action cannot be undone.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button type="button" onClick={handleDelete} className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px]">
              Delete
            </button>
            <button type="button" onClick={() => setDeleteId(null)} className="btn-base btn-secondary text-sm px-5 py-2 min-h-[44px]">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
