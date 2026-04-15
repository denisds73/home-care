import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { useLocationStore } from '../../store/useLocationStore'
import { locationService } from '../../services/locationService'
import { PlacesAutocomplete } from '../maps'
import { ImmersiveLocationMap } from '../maps/ImmersiveLocationMap'
import { ENV } from '../../config/env'
import type { LocationData } from '../../types/domain'

interface LocationPickerContentProps {
  onClose: () => void
}

export const LocationPickerContent = memo(({ onClose }: LocationPickerContentProps) => {
  const location = useLocationStore(s => s.location)
  const status = useLocationStore(s => s.status)
  const setLocation = useLocationStore(s => s.setLocation)
  const detectCurrentLocation = useLocationStore(s => s.detectCurrentLocation)

  const [selectedPlace, setSelectedPlace] = useState<LocationData | null>(null)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Drag hint — auto-dismiss after 4s or first drag
  const [showDragHint, setShowDragHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowDragHint(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Debounce ref for OSM search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks the latest geocode call so stale responses are ignored
  const geocodeIdRef = useRef(0)

  // Map center — derived from selected place or stored location
  const mapLat = selectedPlace?.lat ?? location?.lat ?? 12.9716
  const mapLng = selectedPlace?.lng ?? location?.lng ?? 77.5946

  const hasPlaces = !!ENV.GOOGLE_PLACES_KEY

  /* ── Map pan handler — reverse geocodes the center position ── */
  const handleMapPan = useCallback(async (lat: number, lng: number) => {
    setShowDragHint(false)

    // Immediately capture the coordinates
    const thisCallId = ++geocodeIdRef.current
    setIsReverseGeocoding(true)

    let result: LocationData
    try {
      result = await locationService.reverseGeocode(lat, lng)
    } catch {
      result = {
        label: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        fullAddress: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
        lat, lng, placeId: null,
      }
    }

    // Only apply if this is still the latest call (prevents stale overwrites)
    if (geocodeIdRef.current !== thisCallId) return

    setSelectedPlace({ ...result, lat, lng })
    setIsReverseGeocoding(false)
  }, [])

  // Cleanup search timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  /* ── GPS detect ── */
  const handleDetect = useCallback(async () => {
    if (status === 'detecting') return
    await detectCurrentLocation()
    const resolved = useLocationStore.getState()
    if (resolved.status === 'resolved' && resolved.location) {
      setSelectedPlace(resolved.location)
    }
  }, [status, detectCurrentLocation])

  /* ── Search (OSM path — debounced) ── */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)

    if (query.length < 3) {
      setSearchResults([])
      return
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await locationService.searchPlaces(query)
        if (isMountedRef.current) setSearchResults(results)
      } catch {
        if (isMountedRef.current) setSearchResults([])
      } finally {
        if (isMountedRef.current) setIsSearching(false)
      }
    }, 300)
  }, [])

  /* ── Place select (from autocomplete or OSM results) ── */
  const handlePlaceSelect = useCallback((place: LocationData) => {
    setSelectedPlace(place)
    setSearchQuery(place.fullAddress)
    setSearchResults([])
    setSearchFocused(false)
  }, [])

  /* ── Drag state change — memoized to avoid breaking ImmersiveLocationMap's memo ── */
  const handleDragState = useCallback((dragging: boolean) => {
    if (dragging) setShowDragHint(false)
  }, [])

  /* ── Confirm ── */
  const handleConfirm = useCallback(() => {
    if (selectedPlace) {
      setLocation(selectedPlace)
      onClose()
    }
  }, [selectedPlace, setLocation, onClose])

  /* ── Manual entry submit ── */
  const handleManualSubmit = useCallback(() => {
    if (!manualAddress.trim()) return
    const place: LocationData = {
      label: manualAddress.split(',')[0]?.trim() || 'Custom Address',
      fullAddress: manualAddress.trim(),
      lat: selectedPlace?.lat ?? location?.lat ?? 12.9716,
      lng: selectedPlace?.lng ?? location?.lng ?? 77.5946,
      placeId: null,
    }
    setLocation(place)
    onClose()
  }, [manualAddress, selectedPlace, location, setLocation, onClose])

  // Resolve the current address label to display
  const displayLabel = selectedPlace?.label ?? location?.label ?? 'Your Location'
  const displayAddress = selectedPlace?.fullAddress ?? location?.fullAddress ?? ''

  return (
    <div className="flex flex-col h-full">
      {/* ── MAP HERO ── */}
      <div className="relative flex-shrink-0" style={{ height: 'clamp(240px, 50vw, 340px)' }}>
        <ImmersiveLocationMap
          lat={mapLat}
          lng={mapLng}
          onLocationChange={handleMapPan}
          onDragStateChange={handleDragState}
        />

        {/* Floating search bar + close button row */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {hasPlaces ? (
              <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60">
                <PlacesAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={handlePlaceSelect}
                  placeholder="Search for area, street name..."
                  floating
                />
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60 overflow-hidden">
                  <svg
                    className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none z-10"
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
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-transparent border-0 outline-none placeholder:text-muted"
                    placeholder="Search for area, street name..."
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="absolute right-3.5 w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* OSM search results dropdown */}
                {searchFocused && searchResults.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-default shadow-xl max-h-48 overflow-y-auto z-30 fade-in">
                    {searchResults.map((r, i) => (
                      <li key={r.placeId ?? `osm-${i}`}>
                        <button
                          type="button"
                          onMouseDown={() => handlePlaceSelect(r)}
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
            )}
          </div>

          {/* Close button — integrated in search row */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-white/60 shrink-0 hover:bg-white transition"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* GPS locate FAB */}
        <button
          type="button"
          onClick={handleDetect}
          disabled={status === 'detecting'}
          className="absolute bottom-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-lg border border-default hover:shadow-xl hover:border-brand/20 transition-all active:scale-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label="Detect my current location"
        >
          {status === 'detecting' ? (
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" />
              <line x1="2" y1="12" x2="4" y2="12" strokeLinecap="round" />
              <line x1="20" y1="12" x2="22" y2="12" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Drag hint pill — auto-dismisses */}
        {showDragHint && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-2 rounded-full bg-black/70 backdrop-blur-sm shadow-lg pointer-events-none">
            <p className="text-[11px] font-medium text-white whitespace-nowrap">
              Move the map to adjust pin
            </p>
          </div>
        )}

        {/* Status: denied */}
        {status === 'denied' && (
          <div className="absolute bottom-4 left-4 right-16 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/95 backdrop-blur-sm border border-amber-200/60 shadow-sm fade-in">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-[11px] text-amber-800 font-medium">Location access denied</p>
          </div>
        )}
      </div>

      {/* ── ADDRESS CONFIRM SHEET ── */}
      <div className="flex-shrink-0 px-5 pt-4 pb-5 space-y-3 bg-white">
        {/* Address display */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-soft shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            {isReverseGeocoding ? (
              /* Shimmer skeleton while geocoding */
              <div className="space-y-2 py-0.5">
                <div className="h-4 w-36 bg-muted rounded-md animate-pulse" />
                <div className="h-3 w-52 bg-muted/60 rounded-md animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-primary leading-snug">{displayLabel}</p>
                {displayAddress && displayAddress !== displayLabel && (
                  <p className="text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">{displayAddress}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedPlace && !location}
          className="btn-base btn-primary w-full justify-center min-h-[48px] text-sm font-bold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm this location
        </button>

        {/* Manual entry toggle */}
        {!showManualEntry ? (
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="w-full text-center text-xs text-muted hover:text-brand font-semibold transition min-h-[32px]"
          >
            Enter address manually
          </button>
        ) : (
          <div className="fade-in space-y-2">
            <textarea
              rows={2}
              value={manualAddress}
              onChange={e => setManualAddress(e.target.value)}
              className="input-base w-full px-3.5 py-2.5 text-sm resize-none"
              placeholder="e.g. 42, 5th Cross, Koramangala, Bangalore"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowManualEntry(false)}
                className="btn-base btn-secondary flex-1 justify-center min-h-[40px] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={!manualAddress.trim()}
                className="btn-base btn-primary flex-1 justify-center min-h-[40px] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Use this address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

LocationPickerContent.displayName = 'LocationPickerContent'
