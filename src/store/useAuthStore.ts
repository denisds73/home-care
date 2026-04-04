import { create } from 'zustand'
import type { Role, User } from '../types/domain'
import { authService } from '../services/authService'

const TOKEN_KEY = 'homecare_token'

interface AuthState {
  user: User | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setAuth: (user: User, token: string) => void
  login: (email: string, password: string, role: Role) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({
      user,
      token,
      role: user.role,
      isAuthenticated: true,
      error: null,
    })
  },

  login: async (email, password, _role) => {
    set({ isLoading: true, error: null })
    try {
      const result = await authService.login({ email, password })
      const { user, token } = result.data
      localStorage.setItem(TOKEN_KEY, token)
      set({
        user,
        token,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      error: null,
    })
  },

  restoreSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    set({ isLoading: true })
    try {
      const result = await authService.getCurrentUser()
      const { user } = result.data
      set({
        user,
        token,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
