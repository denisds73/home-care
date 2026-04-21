import { create } from 'zustand'
import type { LocationData, LocationStatus, CityData } from '../types/domain'
import { locationService } from '../services/locationService'
import { checkServiceability } from '../data/cities'

const STORAGE_KEY = 'hc_location'

const DEFAULT_LOCATION: LocationData = {
  label: 'Bangalore',
  fullAddress: 'Bangalore, Karnataka',
  lat: 12.9716,
  lng: 77.5946,
  placeId: null,
  city: 'Bangalore',
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

// Compute serviceability from persisted location on init
const initialLocation = readPersistedLocation()
const initialCheck = checkServiceability(initialLocation)

interface LocationStore {
  location: LocationData | null
  status: LocationStatus
  serviceable: boolean
  serviceableCity: CityData | null
  bannerDismissed: boolean
  setLocation: (location: LocationData) => void
  setStatus: (status: LocationStatus) => void
  detectCurrentLocation: () => Promise<void>
  dismissBanner: () => void
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  location: initialLocation,
  status: 'idle',
  serviceable: initialCheck.serviceable,
  serviceableCity: initialCheck.matchedCity ?? null,
  bannerDismissed: false,

  setLocation: (location) => {
    persistLocation(location)
    const result = checkServiceability(location)
    set({
      location,
      status: 'resolved',
      serviceable: result.serviceable,
      serviceableCity: result.matchedCity ?? null,
      bannerDismissed: false, // Reset on location change
    })
  },

  setStatus: (status) => set({ status }),

  dismissBanner: () => set({ bannerDismissed: true }),

  detectCurrentLocation: async () => {
    if (get().status === 'detecting') return
    set({ status: 'detecting' })

    try {
      const pos = await locationService.getCurrentPosition()
      const { latitude, longitude } = pos.coords
      const locationData = await locationService.reverseGeocode(latitude, longitude)
      persistLocation(locationData)
      const result = checkServiceability(locationData)
      set({
        location: locationData,
        status: 'resolved',
        serviceable: result.serviceable,
        serviceableCity: result.matchedCity ?? null,
        bannerDismissed: false,
      })
    } catch (err: unknown) {
      const isDenied =
        err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED
      if (isDenied) {
        const fallback = get().location ?? DEFAULT_LOCATION
        persistLocation(fallback)
        const result = checkServiceability(fallback)
        set({
          location: fallback,
          status: 'denied',
          serviceable: result.serviceable,
          serviceableCity: result.matchedCity ?? null,
        })
      } else {
        set({ status: 'error' })
      }
    }
  },
}))
