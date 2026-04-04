import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import type { AdminUser } from '../../services/adminService'
import useStore from '../../store/useStore'
import { formatDate } from '../../data/helpers'

export default function UserManagementPage() {
  const showToast = useStore(s => s.showToast)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await adminService.getUsers()
      setUsers(result.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const toggleActive = async (id: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      await adminService.updateUserStatus(id, newStatus)
      showToast('User status updated', 'success')
      await loadUsers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update user status', 'danger')
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">User Management</h1>
        <p className="text-muted text-sm mt-1">View and manage registered customers.</p>
      </div>

      <div>
        <input
          type="text"
          className="input-base py-2 px-4 text-sm w-full max-w-md"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadUsers} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="glass-card overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="h-4 w-28 bg-surface rounded" />
                  <div className="h-4 w-36 bg-surface rounded" />
                  <div className="h-4 w-12 bg-surface rounded" />
                  <div className="h-4 w-20 bg-surface rounded" />
                  <div className="h-4 w-16 bg-surface rounded" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted bg-surface">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-surface/50">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-secondary">{u.email}</td>
                    <td className="p-3">{u.bookings}</td>
                    <td className="p-3 text-muted">{formatDate(u.joinedAt)}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold ${u.status === 'active' ? 'text-success' : 'text-error'}`}>
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(u.id, u.status)}
                        className={`text-xs font-semibold min-h-[44px] ${u.status === 'active' ? 'text-error' : 'text-success'}`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
