import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  hasHydrated: boolean
  error: string | null
  login: (email: string, password: string, role?: Role) => Promise<void>
  signup: (data: SignupDto) => Promise<void>
  logout: () => void
  clearError: () => void
  restoreSession: () => Promise<void>
  updateUser: (partial: Partial<User>) => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
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
            err instanceof Error
              ? err.message
              : 'Login failed. Please try again.'
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
            err instanceof Error
              ? err.message
              : 'Signup failed. Please try again.'
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

      updateUser: (partial) => {
        set((state) => {
          if (!state.user) return { user: state.user }
          // Strip undefined so we never wipe existing fields with undefined
          const clean: Partial<User> = {}
          for (const [k, v] of Object.entries(partial)) {
            if (v !== undefined) {
              ;(clean as Record<string, unknown>)[k] = v
            }
          }
          return { user: { ...state.user, ...clean } }
        })
      },

      setHasHydrated: (v) => set({ hasHydrated: v }),

      restoreSession: async () => {
        const token = getStoredToken()
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })

        try {
          const result = await authService.getCurrentUser()
          const { user: serverUser } = result.data
          // Merge server-authoritative fields into the existing persisted user
          // so that any locally-edited fields the backend doesn't yet know about
          // (or doesn't return) survive a page refresh. Undefined/null server
          // values are stripped so they don't wipe local edits.
          set((state) => {
            const cleanServer: Partial<User> = {}
            for (const [k, v] of Object.entries(serverUser)) {
              if (v !== undefined && v !== null) {
                ;(cleanServer as Record<string, unknown>)[k] = v
              }
            }
            const mergedUser = state.user
              ? ({ ...state.user, ...cleanServer } as User)
              : (serverUser as User)
            return {
              user: mergedUser,
              token,
              role: mergedUser.role,
              isAuthenticated: true,
              isLoading: false,
            }
          })
        } catch (err) {
          // Only clear auth on explicit 401 (handled inside api.ts logout already).
          // For network/404/500 errors, keep the persisted session intact so
          // the user is not logged out by transient backend issues.
          const status =
            err && typeof err === 'object' && 'status' in err
              ? (err as { status?: number }).status
              : undefined
          if (status === 401) {
            clearStoredToken()
            set({
              user: null,
              token: null,
              role: null,
              isAuthenticated: false,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        }
      },
    }),
    {
      name: 'homecare_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Mirror the persisted token into the legacy TOKEN_KEY slot so the
        // fetch wrapper in api.ts (which reads localStorage directly) sees it.
        if (state?.token) {
          setStoredToken(state.token)
        }
        state?.setHasHydrated(true)
      },
    },
  ),
)
