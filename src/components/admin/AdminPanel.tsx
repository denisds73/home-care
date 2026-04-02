import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { getCategoryName, formatDate, formatDateTime, formatTimeSlot, formatPaymentMode, formatPaymentStatus, statusClass, paymentBadgeClass, getValidTransitions } from '../../data/helpers'
import Modal from '../common/Modal'
import type { Booking, BookingStatus, CategoryId, Service } from '../../types/domain'

type AdminTab = 'dashboard' | 'catalog'

interface AdminFilters {
  dateFrom: string
  dateTo: string
  category: string
  status: string
  search: string
}

interface SvcFormState {
  category: CategoryId
  service_name: string
  description: string
  price: string | number
  is_basic: boolean
  is_active: boolean
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const services = useStore(s => s.services)
  const bookings = useStore(s => s.bookings)
  const updateBookingStatus = useStore(s => s.updateBookingStatus)
  const addService = useStore(s => s.addService)
  const updateService = useStore(s => s.updateService)
  const deleteService = useStore(s => s.deleteService)
  const toggleServiceActive = useStore(s => s.toggleServiceActive)
  const showToast = useStore(s => s.showToast)
  const [tab, setTab] = useState<AdminTab>('dashboard')

  const [filters, setFilters] = useState<AdminFilters>({ dateFrom: '', dateTo: '', category: '', status: '', search: '' })
  const [sortField, setSortField] = useState<keyof Booking>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const [serviceModal, setServiceModal] = useState<'add' | Service | null>(null)
  const [deleteModal, setDeleteModal] = useState<number | null>(null)
  const [svcForm, setSvcForm] = useState<SvcFormState>({ category: 'ac', service_name: '', description: '', price: '', is_basic: false, is_active: true })
  const [svcError, setSvcError] = useState('')

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'Pending').length,
    confirmed: bookings.filter(b => b.booking_status === 'Confirmed').length,
    completed: bookings.filter(b => b.booking_status === 'Completed').length,
  }

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let list = [...bookings]
    if (filters.dateFrom) list = list.filter(b => b.preferred_date >= filters.dateFrom)
    if (filters.dateTo) list = list.filter(b => b.preferred_date <= filters.dateTo)
    if (filters.category) list = list.filter(b => b.category === filters.category)
    if (filters.status) list = list.filter(b => b.booking_status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(b => b.booking_id.toLowerCase().includes(q) || b.customer_name.toLowerCase().includes(q) || b.phone.includes(q))
    }
    list.sort((a, b) => {
      let va: string | number | undefined = a[sortField] as string | number | undefined
      let vb: string | number | undefined = b[sortField] as string | number | undefined
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va === undefined || vb === undefined) return 0
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })
    return list
  }, [bookings, filters, sortField, sortAsc])

  const handleSort = (field: keyof Booking) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const handleSaveStatus = () => {
    if (selectedBooking && newStatus) {
      updateBookingStatus(selectedBooking.booking_id, newStatus as BookingStatus)
      showToast('Status updated to ' + newStatus, 'success')
      setSelectedBooking(null)
    }
  }

  const openEditService = (svc: Service) => {
    setSvcForm({ category: svc.category, service_name: svc.service_name, description: svc.description, price: svc.price, is_basic: svc.is_basic, is_active: svc.is_active })
    setServiceModal(svc)
    setSvcError('')
  }

  const openAddService = () => {
    setSvcForm({ category: 'ac', service_name: '', description: '', price: '', is_basic: false, is_active: true })
    setServiceModal('add')
    setSvcError('')
  }

  const handleSaveService = () => {
    const priceNum = typeof svcForm.price === 'string' ? parseInt(svcForm.price, 10) : svcForm.price
    if (!svcForm.service_name.trim() || !priceNum || priceNum <= 0) {
      setSvcError('Name and valid price required.')
      return
    }
    const now = new Date().toISOString()
    if (serviceModal === 'add') {
      addService({ ...svcForm, price: priceNum, created_at: now, updated_at: now })
      showToast('Service added', 'success')
    } else if (serviceModal) {
      updateService(serviceModal.id, { ...svcForm, price: priceNum, updated_at: now })
      showToast('Service updated', 'success')
    }
    setServiceModal(null)
  }

  return (
    <div className="fade-in">
      {/* Admin tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          <button onClick={() => setTab('dashboard')} className={`px-4 sm:px-5 py-3.5 text-sm font-medium transition whitespace-nowrap ${tab === 'dashboard' ? 'border-b-[3px] border-brand text-brand' : 'text-secondary hover:text-gray-800'}`}>Dashboard</button>
          <button onClick={() => setTab('catalog')} className={`px-4 sm:px-5 py-3.5 text-sm font-medium transition whitespace-nowrap ${tab === 'catalog' ? 'border-b-[3px] border-brand text-brand' : 'text-secondary hover:text-gray-800'}`}>Service Catalog</button>
          <div className="flex-1" />
          <button onClick={() => navigate('/')} className="px-4 py-2 my-2 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition text-secondary">← Back to App</button>
        </div>
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: 'Total Bookings', val: stats.total, cls: 'stat-border-primary', color: 'var(--color-text-primary)' },
              { label: 'Pending', val: stats.pending, cls: 'stat-border-warning', color: 'var(--color-warning)' },
              { label: 'Confirmed', val: stats.confirmed, cls: 'stat-border-info', color: 'var(--color-info)' },
              { label: 'Completed', val: stats.completed, cls: 'stat-border-success', color: 'var(--color-success)' },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm ${s.cls}`}>
                <p className="text-xs text-secondary uppercase tracking-wide">{s.label}</p>
                <p className="text-xl sm:text-2xl font-extrabold mt-1" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-6">
            <h3 className="font-semibold text-sm mb-3 text-primary">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="input-base w-full px-3 py-2 text-sm" />
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="input-base w-full px-3 py-2 text-sm" />
              <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="input-base w-full px-3 py-2 text-sm">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-base w-full px-3 py-2 text-sm">
                <option value="">All Statuses</option>
                {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Search name / phone / ID..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="input-base w-full px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => showToast('Filters applied', 'info')} className="btn-base btn-primary px-5 py-2 rounded-lg text-sm font-medium">Apply</button>
              <button onClick={() => setFilters({ dateFrom: '', dateTo: '', category: '', status: '', search: '' })} className="btn-base btn-secondary px-5 py-2 rounded-lg text-sm font-medium">Clear</button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b flex items-center justify-between">
              <h3 className="font-semibold text-primary">Bookings</h3>
              <span className="text-sm text-secondary">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-secondary cursor-pointer" onClick={() => handleSort('booking_id')}>ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary cursor-pointer" onClick={() => handleSort('customer_name')}>Customer</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary hidden md:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary cursor-pointer" onClick={() => handleSort('category')}>Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary cursor-pointer hidden lg:table-cell" onClick={() => handleSort('preferred_date')}>Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary hidden md:table-cell">Payment</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.booking_id} className="table-row border-b border-gray-100">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-brand-dark">{b.booking_id}</td>
                      <td className="px-4 py-3 font-medium">{b.customer_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-secondary">{b.phone}</td>
                      <td className="px-4 py-3">{getCategoryName(b.category)}</td>
                      <td className="px-4 py-3 text-secondary hidden lg:table-cell">{formatDate(b.preferred_date)}</td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className={`badge badge-${paymentBadgeClass(b.payment_status)}`}>{formatPaymentStatus(b.payment_status)}</span></td>
                      <td className="px-4 py-3"><span className={`badge badge-${statusClass(b.booking_status)}`}>{b.booking_status}</span></td>
                      <td className="px-4 py-3"><button onClick={() => { setSelectedBooking(b); setNewStatus(b.booking_status) }} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand text-brand-dark hover:bg-muted transition">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && <div className="p-10 text-center text-muted">No bookings match your filters.</div>}
          </div>
        </div>
      )}

      {/* CATALOG */}
      {tab === 'catalog' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold text-primary">Service Catalog</h2>
            <div className="flex gap-2">
              <button onClick={() => showToast('Category management coming soon', 'info')} className="btn-secondary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>Add Category
              </button>
              <button onClick={openAddService} className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>Add Service
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Category', 'Service Name', 'Description', 'Price', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`text-left px-4 py-3 font-semibold text-secondary ${h === 'Description' ? 'hidden md:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id} className="table-row border-b border-gray-100">
                      <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-3">{getCategoryName(s.category)}</td>
                      <td className="px-4 py-3 font-medium">{s.service_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-secondary text-xs max-w-[200px] truncate">{s.description}</td>
                      <td className="px-4 py-3 font-bold text-brand-dark">₹{s.price}</td>
                      <td className="px-4 py-3">{s.is_basic ? <span className="badge bg-muted text-brand">Recommended</span> : <span className="text-muted text-xs">Standard</span>}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleServiceActive(s.id)} className={`text-xs font-medium px-3 py-1 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditService(s)} className="text-xs px-2.5 py-1.5 rounded-lg border border-brand text-brand hover:bg-gray-50">Edit</button>
                          <button onClick={() => setDeleteModal(s.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-red-600 text-red-600 hover:bg-gray-50">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
        {selectedBooking && (() => {
          const b = selectedBooking
          const svcs = b.services_list.length
            ? b.services_list
            : b.service_id != null
              ? [{ id: b.service_id, name: b.service_name, price: b.price, qty: 1 }]
              : []
          return (
            <>
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-bold text-primary">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-muted hover:text-secondary" aria-label="Close booking details">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted">Booking ID</p><p className="font-bold text-sm text-brand-dark">{b.booking_id}</p></div>
                  <div><p className="text-xs text-muted">Created</p><p className="font-semibold text-sm">{formatDateTime(b.created_at)}</p></div>
                  <div><p className="text-xs text-muted">Customer</p><p className="font-semibold text-sm">{b.customer_name}</p></div>
                  <div><p className="text-xs text-muted">Phone</p><p className="font-semibold text-sm">{b.phone}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted">Address</p><p className="font-semibold text-sm">{b.address}</p></div>
                  <div><p className="text-xs text-muted">Category</p><p className="font-semibold text-sm">{getCategoryName(b.category)}</p></div>
                  <div><p className="text-xs text-muted">Location</p><p className="font-mono text-xs text-secondary">{b.lat?.toFixed(4)}, {b.lng?.toFixed(4)}</p></div>
                </div>
                <div className="border-t pt-3 mt-1">
                  <p className="text-xs text-muted mb-2">Services Booked</p>
                  {svcs.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{s.name}{s.qty > 1 ? ` × ${s.qty}` : ''}</span>
                      <span className="font-semibold">₹{s.price * s.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                    <span>Total</span><span className="text-brand-dark">₹{b.price}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div><p className="text-xs text-muted">Date</p><p className="font-semibold text-sm">{formatDate(b.preferred_date)}</p></div>
                  <div><p className="text-xs text-muted">Time Slot</p><p className="font-semibold text-sm">{formatTimeSlot(b.time_slot)}</p></div>
                  <div><p className="text-xs text-muted">Payment Mode</p><p className="font-semibold text-sm">{formatPaymentMode(b.payment_mode)}</p></div>
                  <div><p className="text-xs text-muted">Payment Status</p><span className={`badge badge-${paymentBadgeClass(b.payment_status)}`}>{formatPaymentStatus(b.payment_status)}</span></div>
                  <div><p className="text-xs text-muted">Status</p><span className={`badge badge-${statusClass(b.booking_status)}`}>{b.booking_status}</span></div>
                  <div><p className="text-xs text-muted">Last Updated</p><p className="font-semibold text-sm">{formatDateTime(b.updated_at)}</p></div>
                </div>
              </div>
              <div className="p-5 border-t">
                <label className="block text-sm font-medium text-secondary mb-1">Update Status</label>
                <div className="flex gap-2">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-base flex-1 px-3 py-2 text-sm">
                    {getValidTransitions(b.booking_status).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handleSaveStatus} className="btn-base btn-success px-5 py-2 rounded-lg text-sm font-medium">Save</button>
                </div>
              </div>
            </>
          )
        })()}
      </Modal>

      {/* Service Add/Edit Modal */}
      <Modal isOpen={!!serviceModal} onClose={() => setServiceModal(null)} maxWidth="max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-primary">{serviceModal === 'add' ? 'Add Service' : 'Edit Service'}</h3>
          <button onClick={() => setServiceModal(null)} className="text-muted hover:text-secondary" aria-label="Close service editor">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Category *</label>
            <select value={svcForm.category} onChange={e => setSvcForm(f => ({ ...f, category: e.target.value as CategoryId }))} className="input-base w-full px-3 py-2.5 text-sm">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Service Name *</label>
            <input value={svcForm.service_name} onChange={e => setSvcForm(f => ({ ...f, service_name: e.target.value }))} className="input-base w-full px-3 py-2.5 text-sm" placeholder="e.g. Deep Cleaning" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea rows={2} value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} className="input-base w-full px-3 py-2.5 text-sm" placeholder="Brief description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Price (INR) *</label>
            <input type="number" min={0} value={svcForm.price === '' ? '' : svcForm.price} onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))} className="input-base w-full px-3 py-2.5 text-sm" placeholder="499" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={svcForm.is_basic} onChange={e => setSvcForm(f => ({ ...f, is_basic: e.target.checked }))} className="w-4 h-4 accent-orange-500" /> Recommended</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={svcForm.is_active} onChange={e => setSvcForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-orange-500" /> Active</label>
          </div>
          {svcError && <p className="text-red-500 text-sm">{svcError}</p>}
          <button onClick={handleSaveService} className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-sm">Save Service</button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-100">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-primary">Delete Service?</h3>
          <p className="text-secondary text-sm mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModal(null)} className="flex-1 btn-base btn-secondary py-2.5 rounded-xl text-sm font-medium">Cancel</button>
            <button type="button" onClick={() => { if (deleteModal != null) deleteService(deleteModal); setDeleteModal(null); showToast('Service deleted', 'success') }} className="flex-1 btn-base btn-danger py-2.5 rounded-xl text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
