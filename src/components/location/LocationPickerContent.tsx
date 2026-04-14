import { memo, useState } from 'react'
import { useLocationStore } from '../../store/useLocationStore'
import { locationService } from '../../services/locationService'
import type { LocationData } from '../../types/domain'

interface LocationPickerContentProps {
  onClose: () => void
}

export const LocationPickerContent = memo(({ onClose }: LocationPickerContentProps) => {
  const location = useLocationStore(s => s.location)
  const status = useLocationStore(s => s.status)
  const setLocation = useLocationStore(s => s.setLocation)
  const detectCurrentLocation = useLocationStore(s => s.detectCurrentLocation)

  const [manualAddress, setManualAddress] = useState('')
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleDetect = async () => {
    await detectCurrentLocation()
    const resolved = useLocationStore.getState()
    if (resolved.status === 'resolved') onClose()
  }

  const handleManualSubmit = () => {
    if (!manualAddress.trim()) return
    setLocation({
      label: manualAddress.split(',')[0]?.trim() || 'Custom Address',
      fullAddress: manualAddress.trim(),
      lat: location?.lat ?? 12.9716,
      lng: location?.lng ?? 77.5946,
      placeId: null,
    })
    onClose()
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 3) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await locationService.searchPlaces(query)
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (result: LocationData) => {
    setLocation(result)
    setSearchResults([])
    setSearchQuery('')
    onClose()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-primary">Set service location</h2>
        <p className="text-xs text-muted mt-0.5">
          Where should the technician visit?
        </p>
      </div>

      {/* Detect current location */}
      <button
        type="button"
        onClick={handleDetect}
        disabled={status === 'detecting'}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] bg-primary-soft/40 hover:bg-primary-soft/70 transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
      >
        {status === 'detecting' ? (
          <div className="w-5 h-5 shrink-0 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
            <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
            <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
          </svg>
        )}
        <div className="text-left">
          <p className="text-sm font-semibold text-primary">
            {status === 'detecting' ? 'Detecting...' : 'Use current location'}
          </p>
          <p className="text-[.65rem] text-muted">Using GPS</p>
        </div>
      </button>

      {/* Status messages */}
      {status === 'denied' && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Location access was denied. You can type your address below instead.
        </p>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs text-error bg-red-50 rounded-lg px-3 py-2">
          <span>Could not detect location.</span>
          <button type="button" onClick={handleDetect} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="input-base w-full pl-9 pr-4 py-2.5 text-sm"
            placeholder="Search for area, street name..."
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        {searchResults.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-default shadow-lg z-10 max-h-48 overflow-y-auto">
            {searchResults.map((r, i) => (
              <li key={r.placeId ?? `osm-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition min-h-[44px] flex items-start gap-2.5"
                >
                  <svg
                    className="w-4 h-4 shrink-0 text-brand mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-medium text-primary">{r.label}</p>
                    <p className="text-xs text-muted truncate">{r.fullAddress}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[.65rem] text-muted uppercase tracking-wide">or enter manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual address input */}
      <div>
        <textarea
          rows={2}
          value={manualAddress}
          onChange={e => setManualAddress(e.target.value)}
          className="input-base w-full px-4 py-2.5 text-sm resize-none !rounded-[14px]"
          placeholder="e.g. 42, 5th Cross, Koramangala, Bangalore"
        />
        <button
          type="button"
          onClick={handleManualSubmit}
          disabled={!manualAddress.trim()}
          className="btn-base btn-primary w-full justify-center min-h-[44px] text-sm mt-2 !rounded-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Use this address
        </button>
      </div>

      {/* Current selection */}
      {location && (
        <div className="flex items-start gap-3 px-3 py-2.5 rounded-[14px] bg-muted/60">
          <svg className="w-4 h-4 shrink-0 text-brand mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted">Current location</p>
            <p className="text-sm font-semibold text-primary truncate">{location.label}</p>
            <p className="text-xs text-muted truncate">{location.fullAddress}</p>
          </div>
          <svg className="w-4 h-4 shrink-0 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  )
})

LocationPickerContent.displayName = 'LocationPickerContent'
