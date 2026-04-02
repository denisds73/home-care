import { create } from 'zustand'
import type { ToastState, ToastType } from '../types/domain'

interface UIStore {
  cartDrawerOpen: boolean
  detailSheetOpen: boolean
  detailServiceId: number | null
  accountSheetOpen: boolean
  adminAuthOpen: boolean
  toast: ToastState | null
  
  toggleCartDrawer: () => void
  openDetailSheet: (id: number) => void
  closeDetailSheet: () => void
  showToast: (msg: string, type?: ToastType) => void
  setAccountSheetOpen: (open: boolean) => void
  setAdminAuthOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  cartDrawerOpen: false,
  detailSheetOpen: false,
  detailServiceId: null,
  accountSheetOpen: false,
  adminAuthOpen: false,
  toast: null,
  
  toggleCartDrawer: () => set(s => ({ cartDrawerOpen: !s.cartDrawerOpen })),
  openDetailSheet: (id) => set({ detailSheetOpen: true, detailServiceId: id }),
  closeDetailSheet: () => set({ detailSheetOpen: false }),
  setAccountSheetOpen: (open) => set({ accountSheetOpen: open }),
  setAdminAuthOpen: (open) => set({ adminAuthOpen: open }),
  
  showToast: (msg, type = 'info') => {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 3500)
  },
}))
