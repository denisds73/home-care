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

  async searchPlaces(query: string): Promise<LocationData[]> {
    if (query.length < 3) return []
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      )
      if (!res.ok) return []
      const data: Array<{
        place_id: string
        display_name: string
        lat: string
        lon: string
        address: NominatimResponse['address']
      }> = await res.json()
      return data.map((item) => {
        const addr = item.address
        const label =
          addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || item.display_name.split(',')[0] || 'Location'
        return {
          label,
          fullAddress: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          placeId: null,
        }
      })
    } catch {
      return []
    }
  }
}

/* ── Helpers ─────────────────────────────────────────────────── */

/** Wait until the Google Maps JS SDK is loaded (by APIProvider). */
function waitForGoogleMaps(timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    const start = Date.now()
    const interval = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(interval)
        resolve()
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        reject(new Error('Google Maps SDK did not load in time'))
      }
    }, 100)
  })
}

/* ── Google provider (uses new Places API — AutocompleteSuggestion + Place class) */

class GoogleLocationProvider implements LocationProvider {
  private geocoder: google.maps.Geocoder | null = null

  private async ensureReady() {
    await waitForGoogleMaps()
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder()
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    await this.ensureReady()
    try {
      const result = await this.geocoder!.geocode({
        location: { lat, lng },
      })
      const first = result.results[0]
      if (!first) {
        return {
          label: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
          fullAddress: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
          lat,
          lng,
          placeId: null,
        }
      }

      const components = first.address_components
      const neighborhood = components.find((c: google.maps.GeocoderAddressComponent) =>
        c.types.includes('sublocality_level_1') || c.types.includes('neighborhood'),
      )
      const locality = components.find((c: google.maps.GeocoderAddressComponent) =>
        c.types.includes('locality'),
      )
      const label = neighborhood?.long_name || locality?.long_name || 'Your Location'

      return {
        label,
        fullAddress: first.formatted_address,
        lat,
        lng,
        placeId: first.place_id,
      }
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

  async searchPlaces(query: string): Promise<LocationData[]> {
    await this.ensureReady()
    if (query.length < 3) return []

    try {
      // Use the new AutocompleteSuggestion API
      const { suggestions } = await google.maps.places.AutocompleteSuggestion
        .fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ['in'],
        })

      const placePredictions = suggestions
        .slice(0, 5)
        .filter((s): s is google.maps.places.AutocompleteSuggestion & {
          placePrediction: google.maps.places.PlacePrediction
        } => s.placePrediction !== undefined)

      if (!placePredictions.length) return []

      // Fetch details for each prediction using the new Place class
      const results = await Promise.all(
        placePredictions.map(async (s): Promise<LocationData | null> => {
          try {
            const place = new google.maps.places.Place({
              id: s.placePrediction.placeId,
            })
            await place.fetchFields({
              fields: ['location', 'displayName', 'formattedAddress'],
            })
            const loc = place.location
            if (!loc) return null

            return {
              label: s.placePrediction.mainText?.toString() ?? '',
              fullAddress: place.formattedAddress ?? s.placePrediction.text?.toString() ?? '',
              lat: loc.lat(),
              lng: loc.lng(),
              placeId: s.placePrediction.placeId,
            }
          } catch {
            return null
          }
        }),
      )

      return results.filter((r): r is LocationData => r !== null)
    } catch {
      return []
    }
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
