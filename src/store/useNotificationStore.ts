import { create } from 'zustand'
import type { Notification } from '../types/domain'

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2 }

function sortByPriority(items: Notification[]): Notification[] {
  return [...items].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority ?? 'normal'] ?? 2) -
      (PRIORITY_ORDER[b.priority ?? 'normal'] ?? 2),
  )
}

function normalize(raw: Record<string, unknown>): Notification {
  const bookingId =
    (raw.booking_id as string | null | undefined) ??
    (raw.bookingId as string | null | undefined) ??
    null
  return {
    id: String(raw.id),
    type: raw.type as Notification['type'],
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    timestamp: (() => {
      if (typeof raw.timestamp === 'string') return raw.timestamp
      if (raw.timestamp instanceof Date) return raw.timestamp.toISOString()
      const d = new Date(typeof raw.timestamp === 'number' ? raw.timestamp : String(raw.timestamp ?? ''))
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
    })(),
    read: Boolean(raw.read),
    booking_id: bookingId,
    priority: (raw.priority as string) ?? 'normal',
  } as Notification
}

interface NotificationState {
  items: Notification[]
  loading: boolean

  /** Replace all items (initial REST load). */
  setItems: (rawItems: Record<string, unknown>[]) => void
  /** Merge fresh REST data, preserving optimistic read states. */
  mergeItems: (rawItems: Record<string, unknown>[]) => void
  /** Prepend a single notification from SSE. */
  prepend: (raw: Record<string, unknown>) => void
  /** Optimistic mark-as-read. */
  markRead: (id: string) => void
  /** Optimistic mark-all-as-read. */
  markAllRead: () => void
  setLoading: (v: boolean) => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],
  loading: true,

  setItems: (rawItems) =>
    set({
      items: sortByPriority(rawItems.map(normalize)),
      loading: false,
    }),

  mergeItems: (rawItems) =>
    set((state) => {
      // Build a set of IDs that were optimistically marked as read in the store
      const readIds = new Set(
        state.items.filter((n) => n.read).map((n) => n.id),
      )
      const merged = rawItems.map(normalize).map((n) =>
        readIds.has(n.id) && !n.read ? { ...n, read: true } : n,
      )
      return { items: sortByPriority(merged), loading: false }
    }),

  prepend: (raw) =>
    set((state) => {
      const notification = normalize(raw)
      // Deduplicate — SSE might deliver a notification already fetched by REST
      if (state.items.some((n) => n.id === notification.id)) return state
      return { items: sortByPriority([notification, ...state.items]) }
    }),

  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    })),

  setLoading: (v) => set({ loading: v }),
}))
