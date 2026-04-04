import { useState } from 'react'
import useStore from '../../store/useStore'
import { formatDate } from '../../data/helpers'

interface MockUser {
  id: string
  name: string
  email: string
  bookings: number
  joinedAt: string
  active: boolean
}

const MOCK_USERS: MockUser[] = [
  { id: 'u-1', name: 'Priya Sharma', email: 'priya@gmail.com', bookings: 12, joinedAt: '2025-08-15', active: true },
  { id: 'u-2', name: 'Rahul Verma', email: 'rahul@gmail.com', bookings: 8, joinedAt: '2025-09-20', active: true },
  { id: 'u-3', name: 'Meena Iyer', email: 'meena@yahoo.com', bookings: 5, joinedAt: '2025-11-05', active: true },
  { id: 'u-4', name: 'Arun Das', email: 'arun@outlook.com', bookings: 3, joinedAt: '2026-01-10', active: false },
  { id: 'u-5', name: 'Sneha Rao', email: 'sneha@gmail.com', bookings: 15, joinedAt: '2025-06-01', active: true },
  { id: 'u-6', name: 'Vikash Jain', email: 'vikash@gmail.com', bookings: 2, joinedAt: '2026-03-15', active: true },
  { id: 'u-7', name: 'Nisha Gupta', email: 'nisha@hotmail.com', bookings: 7, joinedAt: '2025-10-22', active: true },
  { id: 'u-8', name: 'Karthik Reddy', email: 'karthik@gmail.com', bookings: 1, joinedAt: '2026-04-01', active: true },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')
  const showToast = useStore(s => s.showToast)

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, active: !u.active } : u)))
    showToast('User status updated', 'success')
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

      <div className="glass-card overflow-x-auto">
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
                  <span className={`text-xs font-semibold ${u.active ? 'text-success' : 'text-error'}`}>
                    {u.active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(u.id)}
                    className={`text-xs font-semibold min-h-[44px] ${u.active ? 'text-error' : 'text-success'}`}
                  >
                    {u.active ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
