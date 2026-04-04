import { create } from 'zustand'
import type { Role, User } from '../types/domain'

interface AuthState {
  user: User | null
  role: Role | null
  isAuthenticated: boolean
  login: (email: string, role: Role) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,

  login: (email, role) => {
    const name = email.split('@')[0] || 'User'
    set({
      isAuthenticated: true,
      role,
      user: {
        id: crypto.randomUUID(),
        name,
        email,
        role,
      },
    })
  },

  logout: () =>
    set({
      user: null,
      role: null,
      isAuthenticated: false,
    }),
}))
