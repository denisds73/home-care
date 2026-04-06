import { ENV } from '../config/env'
import type { LocationData } from '../types/domain'

/* ── Provider interface ────────────────────────────────────── */

interface LocationProvider {
  reverseGeocode(lat: number, lng: number): Promise<LocationData>
  searchPlaces(query: string): Promise<LocationData[]>
}

/* ── Basic provider (Nominatim / OSM) ─────────────────────── */

interface NominatimResponse {
  display_name: string
  address: {
    suburb?: string
    neighbourhood?: string
    city_district?: string
    city?: string
    town?: string
    state?: string
    country?: string
  }
}

class BasicLocationProvider implements LocationProvider {
  async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      )
      if (!res.ok) throw new Error('Nominatim request failed')

      const data: NominatimResponse = await res.json()
      const addr = data.address
      const label =
        addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || 'Your Location'
      const city = addr.city || addr.town || ''
      const state = addr.state || ''
      const fullAddress = [label, city, state].filter(Boolean).join(', ')

      return { label, fullAddress, lat, lng, placeId: null }
    } catch {
      return {
        label: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        fullAddress: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
        lat,
        lng,
        placeId: null,
      }
    }
  }

  async searchPlaces(): Promise<LocationData[]> {
    // Autocomplete not available without Google Places API
    return []
  }
}

/* ── Google provider (stub — implement when API key is added) */

class GoogleLocationProvider implements LocationProvider {
  async reverseGeocode(): Promise<LocationData> {
    throw new Error('GoogleLocationProvider: load Google Maps JS SDK and implement')
  }

  async searchPlaces(): Promise<LocationData[]> {
    throw new Error('GoogleLocationProvider: load Google Maps JS SDK and implement')
  }
}

/* ── Provider selection ───────────────────────────────────── */

const provider: LocationProvider = ENV.GOOGLE_PLACES_KEY
  ? new GoogleLocationProvider()
  : new BasicLocationProvider()

/* ── Exported service ─────────────────────────────────────── */

export const locationService = {
  hasPlacesApi: !!ENV.GOOGLE_PLACES_KEY,

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000, // cache for 5 min
      })
    })
  },

  reverseGeocode(lat: number, lng: number) {
    return provider.reverseGeocode(lat, lng)
  },

  searchPlaces(query: string) {
    return provider.searchPlaces(query)
  },
}
