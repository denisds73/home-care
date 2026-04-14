import { memo, useCallback } from 'react'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'
import { MapWithFallback, OsmMapEmbed } from './MapWithFallback'

interface ServiceLocationMapProps {
  lat: number
  lng: number
  address?: string
  height?: string
  interactive?: boolean
  showDirectionsLink?: boolean
  className?: string
}

/** Custom purple pin marker with pulsing ring animation. */
function BrandPin() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing ring */}
      <div
        className="absolute w-10 h-10 rounded-full opacity-30"
        style={{
          background: 'var(--color-primary-soft)',
          animation: 'mapPulse 2s ease-in-out infinite',
        }}
      />
      {/* Pin body */}
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
          fill="var(--color-primary)"
        />
        <circle cx="16" cy="16" r="7" fill="white" />
        <circle cx="16" cy="16" r="4" fill="var(--color-primary)" />
      </svg>
    </div>
  )
}

/**
 * Static or semi-interactive map showing a service location.
 * Renders Google Maps when API is available, OSM embed otherwise.
 */
export const ServiceLocationMap = memo(function ServiceLocationMap({
  lat,
  lng,
  address,
  height = '200px',
  interactive = false,
  showDirectionsLink = false,
  className = '',
}: ServiceLocationMapProps) {
  const handleDirections = useCallback(() => {
    const q = address ? encodeURIComponent(address) : `${lat},${lng}`
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank')
  }, [lat, lng, address])

  // No API key — use OSM embed directly (skip MapWithFallback which needs APIProvider context)
  if (!ENV.GOOGLE_PLACES_KEY) {
    return (
      <OsmMapEmbed
        lat={lat}
        lng={lng}
        address={address}
        height={height}
        interactive={interactive}
        showDirectionsLink={showDirectionsLink}
        className={className}
      />
    )
  }

  return (
    <MapWithFallback
      lat={lat}
      lng={lng}
      address={address}
      height={height}
      interactive={interactive}
      showDirectionsLink={showDirectionsLink}
      className={className}
    >
      <div
        className={`overflow-hidden rounded-xl border border-default shadow-sm relative ${className}`}
        style={{ height }}
      >
        <Map
          defaultCenter={{ lat, lng }}
          defaultZoom={15}
          gestureHandling={interactive ? 'cooperative' : 'none'}
          disableDefaultUI={!interactive}
          zoomControl={interactive}
          colorScheme="LIGHT"
        >
          <AdvancedMarker position={{ lat, lng }}>
            <BrandPin />
          </AdvancedMarker>
        </Map>

        {showDirectionsLink && (
          <button
            type="button"
            onClick={handleDirections}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-default shadow-md text-xs font-semibold text-brand hover:bg-white transition min-h-[36px]"
            aria-label="Get directions to service location"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions
          </button>
        )}
      </div>
    </MapWithFallback>
  )
})
