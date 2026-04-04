import { create } from 'zustand'
import type { Role, User } from '../types/domain'
import { authService } from '../services/authService'
import type { SignupDto } from '../services/authService'
import { getStoredToken, setStoredToken, clearStoredToken } from '../lib/auth'

interface AuthState {
  user: User | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, role?: Role) => Promise<void>
  signup: (data: SignupDto) => Promise<void>
  logout: () => void
  clearError: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (email, password, _role?) => {
    set({ isLoading: true, error: null })
    try {
      const result = await authService.login({ email, password })
      const { user, token } = result.data
      setStoredToken(token)
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

  signup: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const result = await authService.signup(data)
      const { user, token } = result.data
      setStoredToken(token)
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
        err instanceof Error ? err.message : 'Signup failed. Please try again.'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: () => {
    clearStoredToken()
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },

  restoreSession: async () => {
    const token = getStoredToken()
    if (!token) return

    set({ isLoading: true })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

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
      clearStoredToken()
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } finally {
      clearTimeout(timeout)
    }
  },
}))
