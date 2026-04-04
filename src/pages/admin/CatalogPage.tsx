import { useState } from 'react'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import Modal from '../../components/common/Modal'
import type { CategoryId, Service } from '../../types/domain'
import type { ServiceDraft } from '../../store/useStore'

interface SvcForm {
  category: CategoryId | ''
  service_name: string
  description: string
  price: string
  is_basic: boolean
  is_active: boolean
}

const EMPTY_FORM: SvcForm = {
  category: '',
  service_name: '',
  description: '',
  price: '',
  is_basic: false,
  is_active: true,
}

export default function CatalogPage() {
  const services = useStore(s => s.services)
  const addService = useStore(s => s.addService)
  const updateService = useStore(s => s.updateService)
  const deleteService = useStore(s => s.deleteService)
  const toggleServiceActive = useStore(s => s.toggleServiceActive)
  const showToast = useStore(s => s.showToast)

  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<SvcForm>(EMPTY_FORM)

  const filtered = categoryFilter ? services.filter(s => s.category === categoryFilter) : services

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setModalMode('add')
  }

  const openEdit = (svc: Service) => {
    setForm({
      category: svc.category,
      service_name: svc.service_name,
      description: svc.description,
      price: String(svc.price),
      is_basic: svc.is_basic,
      is_active: svc.is_active,
    })
    setEditingId(svc.id)
    setModalMode('edit')
  }

  const handleSave = () => {
    if (!form.category || !form.service_name || !form.price) {
      showToast('Please fill required fields', 'warning')
      return
    }
    const draft: ServiceDraft = {
      category: form.category as CategoryId,
      service_name: form.service_name,
      description: form.description,
      price: Number(form.price),
      is_basic: form.is_basic,
      is_active: form.is_active,
    }
    if (modalMode === 'add') {
      addService(draft)
      showToast('Service added', 'success')
    } else if (editingId !== null) {
      updateService(editingId, draft)
      showToast('Service updated', 'success')
    }
    setModalMode(null)
  }

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteService(deleteId)
      showToast('Service deleted', 'success')
      setDeleteId(null)
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="input-base py-2 px-3 text-sm"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as CategoryId | '')}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={openAdd} className="btn-base btn-primary text-sm px-4 py-2 ml-auto min-h-[44px]">
          + Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(svc => (
          <div key={svc.id} className={`glass-card p-4 ${!svc.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{svc.service_name}</p>
                <p className="text-xs text-muted">{svc.category.toUpperCase()}</p>
              </div>
              <span className="text-sm font-bold text-brand shrink-0">₹{svc.price}</span>
            </div>
            <p className="text-xs text-secondary mb-3 line-clamp-2">{svc.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => openEdit(svc)} className="text-xs text-brand font-semibold min-h-[44px] px-1">
                Edit
              </button>
              <button
                type="button"
                onClick={() => toggleServiceActive(svc.id)}
                className="text-xs text-secondary font-semibold min-h-[44px] px-1"
              >
                {svc.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(svc.id)}
                className="text-xs text-error font-semibold ml-auto min-h-[44px] px-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalMode !== null} onClose={() => setModalMode(null)} maxWidth="max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">{modalMode === 'add' ? 'Add Service' : 'Edit Service'}</h3>
          <div className="space-y-3">
            <select
              className="input-base w-full py-2.5 px-4 text-sm"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as CategoryId })}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="input-base w-full py-2.5 px-4 text-sm"
              placeholder="Service Name"
              value={form.service_name}
              onChange={e => setForm({ ...form, service_name: e.target.value })}
              maxLength={50}
            />
            <textarea
              className="input-base w-full py-2.5 px-4 text-sm min-h-[80px] resize-y"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="number"
              className="input-base w-full py-2.5 px-4 text-sm"
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={form.is_basic}
                onChange={e => setForm({ ...form, is_basic: e.target.checked })}
              />
              Recommended (Basic) Service
            </label>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={handleSave} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
              {modalMode === 'add' ? 'Add' : 'Save'}
            </button>
            <button type="button" onClick={() => setModalMode(null)} className="btn-base btn-secondary text-sm px-5 py-2 min-h-[44px]">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-primary mb-2">Delete Service?</h3>
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
