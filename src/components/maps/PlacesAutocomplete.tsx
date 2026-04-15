import { memo, useState, useRef, useCallback, useEffect } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import type { LocationData } from '../../types/domain'
import { ENV } from '../../config/env'

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (location: LocationData) => void
  placeholder?: string
  className?: string
  error?: boolean
  /** Borderless transparent mode for floating over map backgrounds */
  floating?: boolean
}

interface Prediction {
  placeId: string
  mainText: string
  description: string
}

/**
 * Styled Google Places autocomplete input using the new Place class API.
 * Falls back to nothing when API key is not configured (parent renders fallback).
 */
export const PlacesAutocomplete = memo(function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for area, street name...',
  className = '',
  error = false,
  floating = false,
}: PlacesAutocompleteProps) {
  const placesLib = useMapsLibrary('places')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!placesLib || input.length < 3) {
        setPredictions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        // Use the new Place Autocomplete API (AutocompleteSuggestion)
        const request = {
          input,
          includedRegionCodes: ['in'],
        }
        const { suggestions } = await (placesLib as typeof google.maps.places).AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

        const mapped: Prediction[] = suggestions
          .slice(0, 5)
          .filter((s): s is google.maps.places.AutocompleteSuggestion & { placePrediction: google.maps.places.PlacePrediction } =>
            s.placePrediction !== undefined,
          )
          .map((s) => ({
            placeId: s.placePrediction.placeId,
            mainText: s.placePrediction.mainText?.toString() ?? '',
            description: s.placePrediction.text?.toString() ?? '',
          }))

        setPredictions(mapped)
        setIsOpen(mapped.length > 0)
      } catch {
        setPredictions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    },
    [placesLib],
  )

  const handleInputChange = useCallback(
    (text: string) => {
      onChange(text)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchPredictions(text), 300)
    },
    [onChange, fetchPredictions],
  )

  const handleSelect = useCallback(
    async (prediction: Prediction) => {
      setIsOpen(false)
      setPredictions([])
      onChange(prediction.description)

      if (!placesLib) return

      try {
        // Use new Place class to fetch details
        const place = new placesLib.Place({ id: prediction.placeId })
        await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] })

        const loc = place.location
        if (loc) {
          onSelect({
            label: prediction.mainText,
            fullAddress: place.formattedAddress ?? prediction.description,
            lat: loc.lat(),
            lng: loc.lng(),
            placeId: prediction.placeId,
          })
        }
      } catch {
        // fetchFields failed — still update the text
      }
    },
    [onChange, onSelect, placesLib],
  )

  // If no API key, don't render (parent should render a fallback)
  if (!ENV.GOOGLE_PLACES_KEY) return null

  return (
    <div ref={containerRef} className={`relative ${className}`}>
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
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (predictions.length > 0) setIsOpen(true) }}
          className={`w-full pl-9 pr-4 py-2.5 text-sm ${floating ? 'bg-transparent border-0 outline-none rounded-2xl' : 'input-base'} ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-default shadow-lg z-20 max-h-56 overflow-y-auto"
          role="listbox"
        >
          {predictions.map((p) => (
            <li key={p.placeId} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleSelect(p)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition min-h-[44px] flex items-start gap-2.5"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-brand mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="font-medium text-primary">{p.mainText}</p>
                  <p className="text-xs text-muted truncate">{p.description}</p>
                </div>
              </button>
            </li>
          ))}
          <li className="px-4 py-1.5 border-t border-default">
            <p className="text-[10px] text-muted text-right">Powered by Google</p>
          </li>
        </ul>
      )}
    </div>
  )
})
