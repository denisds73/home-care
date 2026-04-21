import type { StateId, StateMeta, CityData, LocationData } from '../types/domain'
import type { DropdownOption } from '../components/common/Dropdown'

// ─── States ─────────────────────────────────────────────────────────

export const STATES: StateMeta[] = [
  { id: 'KL', name: 'Kerala' },
  { id: 'TN', name: 'Tamil Nadu' },
  { id: 'KA', name: 'Karnataka' },
]

// ─── Cities ─────────────────────────────────────────────────────────

export const CITIES: CityData[] = [
  // Kerala
  { name: 'Thiruvananthapuram', state: 'KL', aliases: ['Trivandrum'] },
  { name: 'Kochi', state: 'KL', aliases: ['Cochin'] },
  { name: 'Kozhikode', state: 'KL', aliases: ['Calicut'] },
  { name: 'Kollam', state: 'KL', aliases: [] },
  { name: 'Thrissur', state: 'KL', aliases: [] },
  { name: 'Kannur', state: 'KL', aliases: [] },
  { name: 'Alappuzha', state: 'KL', aliases: [] },
  { name: 'Kottayam', state: 'KL', aliases: [] },
  { name: 'Palakkad', state: 'KL', aliases: [] },
  { name: 'Malappuram', state: 'KL', aliases: [] },

  // Tamil Nadu
  { name: 'Chennai', state: 'TN', aliases: [] },
  { name: 'Coimbatore', state: 'TN', aliases: [] },
  { name: 'Madurai', state: 'TN', aliases: [] },
  { name: 'Vellore', state: 'TN', aliases: [] },
  { name: 'Tirunelveli', state: 'TN', aliases: [] },
  { name: 'Tirupattur', state: 'TN', aliases: [] },

  // Karnataka
  { name: 'Bengaluru', state: 'KA', aliases: ['Bangalore'] },
  { name: 'Mysuru', state: 'KA', aliases: ['Mysore'] },
  { name: 'Mangaluru', state: 'KA', aliases: ['Mangalore'] },
  { name: 'Belagavi', state: 'KA', aliases: ['Belgaum'] },
  { name: 'Kolar', state: 'KA', aliases: [] },
  { name: 'Tumakuru', state: 'KA', aliases: ['Tumkur'] },
]

// ─── Helpers ────────────────────────────────────────────────────────

export function getCitiesByState(stateId: StateId): CityData[] {
  return CITIES.filter((c) => c.state === stateId)
}

export function searchCities(query: string, stateId?: StateId): CityData[] {
  const q = query.toLowerCase().trim()
  if (!q) return stateId ? getCitiesByState(stateId) : CITIES

  const pool = stateId ? getCitiesByState(stateId) : CITIES
  return pool.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.aliases.some((a) => a.toLowerCase().includes(q)),
  )
}

function formatCityLabel(city: CityData): string {
  return city.aliases.length > 0
    ? `${city.name} (${city.aliases[0]})`
    : city.name
}

export function getCityDropdownOptions(stateId?: StateId): DropdownOption[] {
  const pool = stateId ? getCitiesByState(stateId) : CITIES
  return pool.map((c) => ({
    value: c.name,
    label: formatCityLabel(c),
  }))
}

export function getStateDropdownOptions(): DropdownOption[] {
  return STATES.map((s) => ({ value: s.id, label: s.name }))
}

export function findCityByName(name: string): CityData | undefined {
  const q = name.toLowerCase().trim()
  return CITIES.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.aliases.some((a) => a.toLowerCase() === q),
  )
}

// ─── Serviceability ─────────────────────────────────────────────────

export interface ServiceabilityResult {
  serviceable: boolean
  matchedCity?: CityData
}

/**
 * Check if a location falls within our service coverage.
 * Tries: explicit city field → label match → fullAddress token scan.
 */
export function checkServiceability(location: LocationData | null): ServiceabilityResult {
  if (!location) return { serviceable: false }

  // 1. Try the structured city field (from geocoding)
  if (location.city) {
    const match = findCityByName(location.city)
    if (match) return { serviceable: true, matchedCity: match }
  }

  // 2. Try matching the label (often a suburb/neighborhood — but sometimes the city itself)
  if (location.label) {
    const match = findCityByName(location.label)
    if (match) return { serviceable: true, matchedCity: match }
  }

  // 3. Scan fullAddress tokens for any city name or alias match
  if (location.fullAddress) {
    const addressLower = location.fullAddress.toLowerCase()
    for (const city of CITIES) {
      if (addressLower.includes(city.name.toLowerCase())) {
        return { serviceable: true, matchedCity: city }
      }
      for (const alias of city.aliases) {
        if (addressLower.includes(alias.toLowerCase())) {
          return { serviceable: true, matchedCity: city }
        }
      }
    }
  }

  return { serviceable: false }
}
