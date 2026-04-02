import { create } from 'zustand'
import type { User } from '../types/domain'

interface AuthStore {
  isLoggedIn: boolean
  user: User | null
  adminUnlocked: boolean
  
  // Actions
  login: (email?: string) => void
  logout: () => void
  unlockAdmin: () => void
  setAuth: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,
  adminUnlocked: false,
  
  login: (email) => set({ 
    isLoggedIn: true, 
    user: { name: email?.split('@')[0] || 'User', email: email || 'user@demo.com' } 
  }),
  logout: () => set({ isLoggedIn: false, user: null, adminUnlocked: false }),
  unlockAdmin: () => set({ adminUnlocked: true }),
  setAuth: (user) => set({ user, isLoggedIn: !!user }),
}))
