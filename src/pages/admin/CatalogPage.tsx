import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { adminService } from '../../services/adminService'
import { serviceService } from '../../services/serviceService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import Modal from '../../components/common/Modal'
import { Pagination } from '../../components/common/Pagination'
import type { CategoryId, Service } from '../../types/domain'
import Dropdown from '../../components/common/Dropdown'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import Tooltip from '../../components/common/Tooltip'
import {
  BanIcon,
  CheckCircleIcon,
  EyeIcon,
  GridIcon,
  PencilIcon,
  TrashIcon,
} from '../../components/common/Icons'
import { adminRowIconAction } from '../../lib/adminRowIconActionStyles'

interface SvcForm {
  category: CategoryId | ''
  service_name: string
  description: string
  price: string
  is_basic: boolean
  is_active: boolean
  long_description: string
  original_price: string
  image_url: string
  estimated_duration: string
  inclusions: string[]
  exclusions: string[]
  faqs: Array<{ question: string; answer: string }>
  rating_average: string
  rating_count: string
  rating_distribution: [string, string, string, string, string]
  sort_order: string
}

const EMPTY_FORM: SvcForm = {
  category: '',
  service_name: '',
  description: '',
  price: '',
  is_basic: false,
  is_active: true,
  long_description: '',
  original_price: '',
  image_url: '',
  estimated_duration: '',
  inclusions: [],
  exclusions: [],
  faqs: [],
  rating_average: '',
  rating_count: '',
  rating_distribution: ['', '', '', '', ''],
  sort_order: '',
}

const PAGE_SIZE = 10

function categoryLabel(id: CategoryId) {
  return CATEGORIES.find(c => c.id === id)?.name ?? id.replace(/_/g, ' ')
}

function formatInr(n: number) {
  return `₹${Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function DetailBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-secondary mb-1">{label}</p>
      <div className="text-sm text-primary">{children}</div>
    </div>
  )
}

export default function CatalogPage() {
  const showToast = useStore(s => s.showToast)

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailService, setDetailService] = useState<Service | null>(null)
  const [form, setForm] = useState<SvcForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [newInclusion, setNewInclusion] = useState('')
  const [newExclusion, setNewExclusion] = useState('')
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')
  const [page, setPage] = useState(1)

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await serviceService.getServices({
        category: categoryFilter || undefined,
        search: search.trim() || undefined,
      })
      setServices(result.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, search])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, search])

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(services.length / PAGE_SIZE))
    setPage(p => Math.min(p, tp))
  }, [services.length])

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return services.slice(start, start + PAGE_SIZE)
  }, [services, page])

  const resetRepeaterInputs = () => {
    setNewInclusion('')
    setNewExclusion('')
    setNewFaqQ('')
    setNewFaqA('')
  }

  const addInclusion = () => {
    const val = newInclusion.trim()
    if (!val) return
    setForm({ ...form, inclusions: [...form.inclusions, val] })
    setNewInclusion('')
  }

  const removeInclusion = (idx: number) => {
    setForm({ ...form, inclusions: form.inclusions.filter((_, i) => i !== idx) })
  }

  const addExclusion = () => {
    const val = newExclusion.trim()
    if (!val) return
    setForm({ ...form, exclusions: [...form.exclusions, val] })
    setNewExclusion('')
  }

  const removeExclusion = (idx: number) => {
    setForm({ ...form, exclusions: form.exclusions.filter((_, i) => i !== idx) })
  }

  const addFaq = () => {
    const q = newFaqQ.trim()
    const a = newFaqA.trim()
    if (!q || !a) return
    setForm({ ...form, faqs: [...form.faqs, { question: q, answer: a }] })
    setNewFaqQ('')
    setNewFaqA('')
  }

  const removeFaq = (idx: number) => {
    setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== idx) })
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    resetRepeaterInputs()
    setModalMode('add')
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setDetailService(null)
    setDetailLoading(false)
  }

  const openViewDetail = async (svc: Service) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailService(null)
    try {
      const res = await serviceService.getServiceById(svc.id)
      setDetailService(res.data ?? svc)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load service', 'danger')
      closeDetail()
    } finally {
      setDetailLoading(false)
    }
  }

  const openEdit = (svc: Service) => {
    setForm({
      category: svc.category,
      service_name: svc.service_name,
      description: svc.description,
      price: String(svc.price),
      is_basic: svc.is_basic,
      is_active: svc.is_active,
      long_description: svc.long_description || '',
      original_price: svc.original_price ? String(svc.original_price) : '',
      image_url: svc.image_url || '',
      estimated_duration: svc.estimated_duration || '',
      inclusions: svc.inclusions || [],
      exclusions: svc.exclusions || [],
      faqs: svc.faqs || [],
      rating_average: svc.rating_average ? String(svc.rating_average) : '',
      rating_count: svc.rating_count ? String(svc.rating_count) : '',
      rating_distribution: (svc.rating_distribution || [0, 0, 0, 0, 0]).map(String) as [string, string, string, string, string],
      sort_order: svc.sort_order ? String(svc.sort_order) : '0',
    })
    setEditingId(svc.id)
    resetRepeaterInputs()
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
      long_description: form.long_description || undefined,
      original_price: form.original_price ? Number(form.original_price) : undefined,
      image_url: form.image_url || undefined,
      estimated_duration: form.estimated_duration || undefined,
      inclusions: form.inclusions.length > 0 ? form.inclusions : undefined,
      exclusions: form.exclusions.length > 0 ? form.exclusions : undefined,
      faqs: form.faqs.length > 0 ? form.faqs : undefined,
      rating_average: form.rating_average ? Number(form.rating_average) : undefined,
      rating_count: form.rating_count ? Number(form.rating_count) : undefined,
      rating_distribution: form.rating_distribution.some(v => v !== '0' && v !== '')
        ? form.rating_distribution.map(Number) : undefined,
      sort_order: form.sort_order ? Number(form.sort_order) : 0,
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
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            className="input-base py-2 px-3 text-sm flex-1 min-w-[200px]"
            placeholder="Search by name or description..."
            aria-label="Search catalog"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
          <Dropdown
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={v => setCategoryFilter(v as CategoryId | '')}
            placeholder="All Categories"
            searchable
            searchPlaceholder="Search category..."
            className="min-w-[170px]"
          />
          <button type="button" onClick={openAdd} className="btn-base btn-primary text-sm px-4 py-2 ml-auto min-h-[44px]">
            + Add Service
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card overflow-x-auto">
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 flex-wrap">
                <div className="h-4 w-40 bg-surface rounded" />
                <div className="h-4 w-24 bg-surface rounded" />
                <div className="h-4 flex-1 min-w-[120px] max-w-md bg-surface rounded" />
                <div className="h-4 w-16 bg-surface rounded" />
                <div className="h-4 w-16 bg-surface rounded" />
                <div className="h-4 w-28 bg-surface rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : services.length === 0 ? (
        <ListEmptyState
          icon={<GridIcon className="w-12 h-12" />}
          title={
            search.trim()
              ? 'No matching services'
              : categoryFilter
                ? 'No services in this category'
                : 'No services in the catalog'
          }
          description={
            search.trim()
              ? 'Try another search phrase, pick a different category, or clear the search box.'
              : categoryFilter
                ? 'Try choosing “All Categories” or add a new service for this category.'
                : 'Add your first service so customers can book it on the platform.'
          }
          action={
            <button
              type="button"
              onClick={openAdd}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] inline-flex"
            >
              + Add Service
            </button>
          }
        />
      ) : (
        <>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm [&_th]:align-top [&_td]:align-top">
              <thead>
                <tr className="text-left text-xs text-muted bg-surface">
                  <th className="p-3">Service</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 min-w-[200px] max-w-md">Description</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map(svc => (
                  <tr
                    key={svc.id}
                    className={`border-t border-gray-50 hover:bg-surface/50 ${!svc.is_active ? 'opacity-70' : ''}`}
                  >
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium text-primary">{svc.service_name}</p>
                        {svc.is_basic && (
                          <span className="inline-flex shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brand">
                            Basic
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted align-top">{categoryLabel(svc.category)}</td>
                    <td className="p-3 text-muted max-w-md align-top">
                      <p className="line-clamp-2" title={svc.description}>
                        {svc.description || '—'}
                      </p>
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col gap-0.5 items-start tabular-nums">
                        <span className="font-medium text-primary">
                          ₹
                          {Number(svc.price).toLocaleString('en-IN', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {svc.original_price != null &&
                          svc.original_price > 0 &&
                          svc.original_price > svc.price && (
                            <span className="text-xs text-muted line-through">
                              ₹
                              {Number(svc.original_price).toLocaleString('en-IN', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      {svc.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge bg-muted text-secondary">Disabled</span>
                      )}
                    </td>
                    <td className="p-3 text-right align-top">
                      <div
                        className="flex items-center justify-end gap-1 flex-wrap"
                        role="group"
                        aria-label={`Actions for ${svc.service_name}`}
                      >
                        <Tooltip label="View full details">
                          <button
                            type="button"
                            onClick={() => void openViewDetail(svc)}
                            className={adminRowIconAction.view}
                            aria-label={`View ${svc.service_name}`}
                          >
                            <EyeIcon className="w-5 h-5 shrink-0" aria-hidden />
                          </button>
                        </Tooltip>
                        <Tooltip label="Edit service">
                          <button
                            type="button"
                            onClick={() => openEdit(svc)}
                            className={adminRowIconAction.edit}
                            aria-label={`Edit ${svc.service_name}`}
                          >
                            <PencilIcon className="w-5 h-5 shrink-0" aria-hidden />
                          </button>
                        </Tooltip>
                        <Tooltip
                          label={svc.is_active ? 'Disable service (hide from customers)' : 'Enable service'}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleActive(svc)}
                            className={
                              svc.is_active ? adminRowIconAction.restrict : adminRowIconAction.allow
                            }
                            aria-label={
                              svc.is_active ? `Disable ${svc.service_name}` : `Enable ${svc.service_name}`
                            }
                          >
                            {svc.is_active ? (
                              <BanIcon className="w-5 h-5 shrink-0" aria-hidden />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5 shrink-0" aria-hidden />
                            )}
                          </button>
                        </Tooltip>
                        <Tooltip label="Delete service permanently">
                          <button
                            type="button"
                            onClick={() => setDeleteId(svc.id)}
                            className={adminRowIconAction.delete}
                            aria-label={`Delete ${svc.service_name}`}
                          >
                            <TrashIcon className="w-5 h-5 shrink-0" aria-hidden />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} limit={PAGE_SIZE} total={services.length} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        maxWidth="max-w-2xl"
        overlay="layout"
        title={modalMode === 'add' ? 'Add Service' : modalMode === 'edit' ? 'Edit Service' : undefined}
      >
        <>
          {/* Section 1: Basic Info */}
          <h4 className="text-sm font-bold text-primary mb-3">Basic Info</h4>
          <div className="space-y-3">
            <div>
              <Dropdown
                options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
                value={form.category}
                onChange={v => setForm({ ...form, category: v as CategoryId })}
                placeholder="Select Category"
                label="Category *"
                searchable
                searchPlaceholder="Search category..."
                id="svc-category"
              />
            </div>
            <div>
              <label htmlFor="svc-name" className="text-xs font-semibold text-secondary mb-1 block">Service Name *</label>
              <input
                id="svc-name"
                type="text"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="Service Name"
                value={form.service_name}
                onChange={e => setForm({ ...form, service_name: e.target.value })}
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="svc-desc" className="text-xs font-semibold text-secondary mb-1 block">Short Description</label>
              <textarea
                id="svc-desc"
                className="input-base w-full text-sm px-3 py-2 min-h-[80px] resize-y"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="svc-long-desc" className="text-xs font-semibold text-secondary mb-1 block">Long Description</label>
              <textarea
                id="svc-long-desc"
                className="input-base w-full text-sm px-3 py-2 min-h-[100px] resize-y"
                rows={4}
                placeholder="Detailed description shown on service detail page"
                value={form.long_description}
                onChange={e => setForm({ ...form, long_description: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="svc-image" className="text-xs font-semibold text-secondary mb-1 block">Image URL</label>
              <input
                id="svc-image"
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
                  className="w-16 h-16 rounded-lg object-cover mt-1"
                  onError={e => { (e.currentTarget.style.display = 'none') }}
                />
              )}
            </div>
            <div>
              <label htmlFor="svc-duration" className="text-xs font-semibold text-secondary mb-1 block">Estimated Duration</label>
              <input
                id="svc-duration"
                type="text"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="45-60 min"
                value={form.estimated_duration}
                onChange={e => setForm({ ...form, estimated_duration: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-border-default my-4" />

          {/* Section 2: Pricing */}
          <h4 className="text-sm font-bold text-primary mb-3">Pricing</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="svc-price" className="text-xs font-semibold text-secondary mb-1 block">Selling Price * (₹)</label>
              <input
                id="svc-price"
                type="number"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="Price (₹)"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="svc-orig-price" className="text-xs font-semibold text-secondary mb-1 block">Original Price (₹)</label>
              <input
                id="svc-orig-price"
                type="number"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="Strike-through price"
                value={form.original_price}
                onChange={e => setForm({ ...form, original_price: e.target.value })}
              />
              {form.original_price && form.price && Number(form.original_price) > Number(form.price) && (
                <p className="text-xs text-success mt-1 font-semibold">
                  {Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100)}% off
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={form.is_basic}
                onChange={e => setForm({ ...form, is_basic: e.target.checked })}
              />
              Recommended (Basic) Service
            </label>
          </div>

          <div className="border-t border-border-default my-4" />

          {/* Section 3: Inclusions */}
          <h4 className="text-sm font-bold text-primary mb-3">What's Included</h4>
          <div className="flex gap-2 mb-2">
            <input
              value={newInclusion}
              onChange={e => setNewInclusion(e.target.value)}
              className="input-base flex-1 text-sm px-3 py-2"
              placeholder="e.g. Gas pressure check"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
              aria-label="New inclusion item"
            />
            <button type="button" onClick={addInclusion} className="btn-base btn-primary px-3 py-2 text-xs shrink-0 min-h-[44px]">Add</button>
          </div>
          {form.inclusions.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => removeInclusion(i)} className="text-muted hover:text-error text-xs min-h-[44px] px-1" aria-label={`Remove ${item}`}>✕</button>
            </div>
          ))}

          <div className="border-t border-border-default my-4" />

          {/* Section 4: Exclusions */}
          <h4 className="text-sm font-bold text-primary mb-3">What's Not Included</h4>
          <div className="flex gap-2 mb-2">
            <input
              value={newExclusion}
              onChange={e => setNewExclusion(e.target.value)}
              className="input-base flex-1 text-sm px-3 py-2"
              placeholder="e.g. Spare parts cost"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
              aria-label="New exclusion item"
            />
            <button type="button" onClick={addExclusion} className="btn-base btn-primary px-3 py-2 text-xs shrink-0 min-h-[44px]">Add</button>
          </div>
          {form.exclusions.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => removeExclusion(i)} className="text-muted hover:text-error text-xs min-h-[44px] px-1" aria-label={`Remove ${item}`}>✕</button>
            </div>
          ))}

          <div className="border-t border-border-default my-4" />

          {/* Section 5: FAQs */}
          <h4 className="text-sm font-bold text-primary mb-3">FAQs</h4>
          <div className="space-y-2 mb-2">
            <input
              value={newFaqQ}
              onChange={e => setNewFaqQ(e.target.value)}
              className="input-base w-full text-sm px-3 py-2"
              placeholder="Question"
              aria-label="FAQ question"
            />
            <textarea
              value={newFaqA}
              onChange={e => setNewFaqA(e.target.value)}
              className="input-base w-full text-sm px-3 py-2 min-h-[60px] resize-y"
              placeholder="Answer"
              aria-label="FAQ answer"
            />
            <button type="button" onClick={addFaq} className="btn-base btn-primary px-3 py-2 text-xs min-h-[44px]">Add FAQ</button>
          </div>
          {form.faqs.map((faq, i) => (
            <div key={i} className="glass-card p-3 mb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{faq.question}</p>
                  <p className="text-xs text-secondary mt-1">{faq.answer}</p>
                </div>
                <button type="button" onClick={() => removeFaq(i)} className="text-muted hover:text-error text-xs shrink-0 min-h-[44px] px-1" aria-label={`Remove FAQ: ${faq.question}`}>✕</button>
              </div>
            </div>
          ))}

          <div className="border-t border-border-default my-4" />

          {/* Section 6: Review Overrides */}
          <h4 className="text-sm font-bold text-primary mb-3">Review Overrides</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="svc-rating-avg" className="text-xs font-semibold text-secondary mb-1 block">Rating Average</label>
                <input
                  id="svc-rating-avg"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="input-base w-full text-sm px-3 py-2"
                  placeholder="0-5"
                  value={form.rating_average}
                  onChange={e => setForm({ ...form, rating_average: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="svc-rating-count" className="text-xs font-semibold text-secondary mb-1 block">Review Count</label>
                <input
                  id="svc-rating-count"
                  type="number"
                  min="0"
                  className="input-base w-full text-sm px-3 py-2"
                  placeholder="0"
                  value={form.rating_count}
                  onChange={e => setForm({ ...form, rating_count: e.target.value })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary mb-2">Distribution (%)</p>
              <div className="grid grid-cols-5 gap-2">
                {(['5', '4', '3', '2', '1'] as const).map((star, i) => (
                  <div key={star}>
                    <label htmlFor={`svc-dist-${star}`} className="text-xs text-muted block text-center mb-1">{star}★</label>
                    <input
                      id={`svc-dist-${star}`}
                      type="number"
                      min="0"
                      max="100"
                      className="input-base w-full text-sm px-2 py-2 text-center"
                      placeholder="0"
                      value={form.rating_distribution[i]}
                      onChange={e => {
                        const updated = [...form.rating_distribution] as [string, string, string, string, string]
                        updated[i] = e.target.value
                        setForm({ ...form, rating_distribution: updated })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border-default my-4" />

          {/* Section 7: Publishing */}
          <h4 className="text-sm font-bold text-primary mb-3">Publishing</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="svc-sort" className="text-xs font-semibold text-secondary mb-1 block">Sort Order</label>
              <input
                id="svc-sort"
                type="number"
                className="input-base w-full text-sm px-3 py-2"
                placeholder="0"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
              />
              Active (visible to customers)
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
        </>
      </Modal>

      <Modal
        isOpen={detailOpen}
        onClose={closeDetail}
        maxWidth="max-w-2xl"
        overlay="layout"
        title={
          detailLoading
            ? 'Service details'
            : detailService?.service_name ?? 'Service details'
        }
      >
        <div className="max-h-[min(70vh,640px)] overflow-y-auto pr-1 space-y-5 text-sm">
          {detailLoading && (
            <div className="py-12 text-center text-muted text-sm" role="status">
              Loading full details…
            </div>
          )}
          {!detailLoading && detailService && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-primary">Basic info</h4>
                <DetailBlock label="Category">{categoryLabel(detailService.category)}</DetailBlock>
                <DetailBlock label="Short description">
                  {detailService.description ? (
                    <p className="whitespace-pre-wrap">{detailService.description}</p>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </DetailBlock>
                <DetailBlock label="Long description">
                  {detailService.long_description ? (
                    <p className="whitespace-pre-wrap text-secondary">{detailService.long_description}</p>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </DetailBlock>
                {detailService.image_url ? (
                  <DetailBlock label="Image">
                    <img
                      src={detailService.image_url}
                      alt=""
                      className="max-h-40 rounded-lg object-cover border border-border-default"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <p className="text-xs text-muted mt-1 break-all">{detailService.image_url}</p>
                  </DetailBlock>
                ) : null}
                <DetailBlock label="Estimated duration">
                  {detailService.estimated_duration || <span className="text-muted">—</span>}
                </DetailBlock>
              </div>

              <div className="border-t border-border-default pt-5 space-y-3">
                <h4 className="text-sm font-bold text-primary">Pricing</h4>
                <DetailBlock label="Selling price">{formatInr(Number(detailService.price))}</DetailBlock>
                {detailService.original_price != null &&
                  detailService.original_price > 0 && (
                    <DetailBlock label="Original price">{formatInr(Number(detailService.original_price))}</DetailBlock>
                  )}
                <p className="text-sm text-secondary">
                  Recommended (basic):{' '}
                  <strong className="text-primary">{detailService.is_basic ? 'Yes' : 'No'}</strong>
                </p>
              </div>

              {(detailService.inclusions?.length ?? 0) > 0 && (
                <div className="border-t border-border-default pt-5">
                  <h4 className="text-sm font-bold text-primary mb-2">Included</h4>
                  <ul className="list-disc list-inside space-y-1 text-secondary">
                    {detailService.inclusions!.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(detailService.exclusions?.length ?? 0) > 0 && (
                <div className="border-t border-border-default pt-5">
                  <h4 className="text-sm font-bold text-primary mb-2">Not included</h4>
                  <ul className="list-disc list-inside space-y-1 text-secondary">
                    {detailService.exclusions!.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(detailService.faqs?.length ?? 0) > 0 && (
                <div className="border-t border-border-default pt-5 space-y-3">
                  <h4 className="text-sm font-bold text-primary">FAQs</h4>
                  {detailService.faqs!.map((faq, i) => (
                    <div key={i} className="glass-card p-3 rounded-lg">
                      <p className="font-semibold text-primary text-sm">{faq.question}</p>
                      <p className="text-secondary text-xs mt-1 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border-default pt-5 space-y-3">
                <h4 className="text-sm font-bold text-primary">Reviews (overrides)</h4>
                <DetailBlock label="Rating average">
                  {detailService.rating_average != null ? String(detailService.rating_average) : '—'}
                </DetailBlock>
                <DetailBlock label="Review count">
                  {detailService.rating_count != null ? String(detailService.rating_count) : '—'}
                </DetailBlock>
                {detailService.rating_distribution &&
                  detailService.rating_distribution.some(n => n > 0) && (
                    <div>
                      <p className="text-xs font-semibold text-secondary mb-2">Star distribution (%)</p>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        {(['5', '4', '3', '2', '1'] as const).map((star, i) => (
                          <div key={star}>
                            <span className="text-muted">{star}★</span>
                            <p className="font-medium text-primary tabular-nums mt-0.5">
                              {detailService.rating_distribution![i] ?? 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="border-t border-border-default pt-5 space-y-3">
                <h4 className="text-sm font-bold text-primary">Publishing</h4>
                <DetailBlock label="Sort order">
                  {detailService.sort_order != null ? String(detailService.sort_order) : '—'}
                </DetailBlock>
                <p className="text-sm text-secondary">
                  Status:{' '}
                  {detailService.is_active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge bg-muted text-secondary">Disabled</span>
                  )}
                </p>
                <DetailBlock label="Service ID">#{detailService.id}</DetailBlock>
                {(detailService.created_at || detailService.updated_at) && (
                  <div className="text-xs text-muted space-y-1">
                    {detailService.created_at && (
                      <p>Created: {detailService.created_at}</p>
                    )}
                    {detailService.updated_at && (
                      <p>Updated: {detailService.updated_at}</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        maxWidth="max-w-sm"
        overlay="layout"
        title="Delete service?"
      >
        <div className="text-center">
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
