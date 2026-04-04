import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import { serviceService } from '../../services/serviceService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import Modal from '../../components/common/Modal'
import type { CategoryId, Service } from '../../types/domain'

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
  const showToast = useStore(s => s.showToast)

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<SvcForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await serviceService.getServices(categoryFilter || undefined)
      setServices(result.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    loadServices()
  }, [loadServices])

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

  const handleSave = async () => {
    if (!form.category || !form.service_name || !form.price) {
      showToast('Please fill required fields', 'warning')
      return
    }
    const payload: Partial<Service> = {
      category: form.category as CategoryId,
      service_name: form.service_name,
      description: form.description,
      price: Number(form.price),
      is_basic: form.is_basic,
      is_active: form.is_active,
    }
    try {
      setIsSaving(true)
      if (modalMode === 'add') {
        await adminService.addService(payload)
        showToast('Service added', 'success')
      } else if (editingId !== null) {
        await adminService.updateService(editingId, payload)
        showToast('Service updated', 'success')
      }
      setModalMode(null)
      await loadServices()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save service', 'danger')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    try {
      await adminService.deleteService(deleteId)
      showToast('Service deleted', 'success')
      setDeleteId(null)
      await loadServices()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete service', 'danger')
    }
  }

  const handleToggleActive = async (svc: Service) => {
    try {
      await adminService.updateService(svc.id, { is_active: !svc.is_active })
      showToast(`Service ${svc.is_active ? 'disabled' : 'enabled'}`, 'success')
      await loadServices()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update service', 'danger')
    }
  }

  if (error && services.length === 0) {
    return (
      <div className="fade-in space-y-6">
        <div className="glass-card p-8 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadServices} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      </div>
    )
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 w-32 bg-surface rounded mb-2" />
              <div className="h-3 w-16 bg-surface rounded mb-3" />
              <div className="h-3 w-full bg-surface rounded mb-1" />
              <div className="h-3 w-3/4 bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
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
                  onClick={() => handleToggleActive(svc)}
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
          {services.length === 0 && (
            <p className="text-sm text-muted col-span-full text-center py-8">No services found</p>
          )}
        </div>
      )}

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
