import { create } from 'zustand'
import type { LocationData, LocationStatus } from '../types/domain'
import { locationService } from '../services/locationService'

const STORAGE_KEY = 'hc_location'

const DEFAULT_LOCATION: LocationData = {
  label: 'Bangalore',
  fullAddress: 'Bangalore, Karnataka',
  lat: 12.9716,
  lng: 77.5946,
  placeId: null,
}

function readPersistedLocation(): LocationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LocationData
  } catch {
    return null
  }
}

function persistLocation(location: LocationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
  } catch {
    // localStorage unavailable — degrade silently
  }
}

interface LocationStore {
  location: LocationData | null
  status: LocationStatus
  setLocation: (location: LocationData) => void
  setStatus: (status: LocationStatus) => void
  detectCurrentLocation: () => Promise<void>
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  location: readPersistedLocation(),
  status: 'idle',

  setLocation: (location) => {
    persistLocation(location)
    set({ location, status: 'resolved' })
  },

  setStatus: (status) => set({ status }),

  detectCurrentLocation: async () => {
    if (get().status === 'detecting') return
    set({ status: 'detecting' })

    try {
      const pos = await locationService.getCurrentPosition()
      const { latitude, longitude } = pos.coords
      const locationData = await locationService.reverseGeocode(latitude, longitude)
      persistLocation(locationData)
      set({ location: locationData, status: 'resolved' })
    } catch (err: unknown) {
      const isDenied =
        err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED
      if (isDenied) {
        const fallback = get().location ?? DEFAULT_LOCATION
        persistLocation(fallback)
        set({ location: fallback, status: 'denied' })
      } else {
        set({ status: 'error' })
      }
    }
  },
}))
