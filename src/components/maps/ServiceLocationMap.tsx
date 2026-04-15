import { memo, useCallback } from 'react'
import { Map, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'
import { OsmMapEmbed, useGoogleMapsAuthFailure } from './MapWithFallback'

interface ServiceLocationMapProps {
  lat: number
  lng: number
  address?: string
  height?: string
  interactive?: boolean
  showDirectionsLink?: boolean
  className?: string
}

/**
 * Static map showing a service location.
 * Uses a CSS overlay pin (same pattern as ImmersiveLocationMap) instead of
 * AdvancedMarker — no mapId requirement, works reliably with any API key.
 */
export const ServiceLocationMap = memo(function ServiceLocationMap({
  lat: rawLat,
  lng: rawLng,
  address,
  height = '200px',
  interactive = false,
  showDirectionsLink = false,
  className = '',
}: ServiceLocationMapProps) {
  const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat
  const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const handleDirections = useCallback(() => {
    const q = address ? encodeURIComponent(address) : `${lat},${lng}`
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank')
  }, [lat, lng, address])

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
    <GoogleServiceMap
      lat={lat}
      lng={lng}
      address={address}
      height={height}
      interactive={interactive}
      showDirectionsLink={showDirectionsLink}
      className={className}
      onDirections={handleDirections}
    />
  )
})

/** Google Maps with CSS overlay pin — no AdvancedMarker, no mapId needed. */
function GoogleServiceMap({
  lat,
  lng,
  address,
  height,
  interactive,
  showDirectionsLink,
  className,
  onDirections,
}: {
  lat: number
  lng: number
  address?: string
  height: string
  interactive: boolean
  showDirectionsLink: boolean
  className: string
  onDirections: () => void
}) {
  const apiStatus = useApiLoadingStatus()
  const authFailed = useGoogleMapsAuthFailure()

  // Fallback to OSM on auth/load failure
  if (apiStatus === 'AUTH_FAILURE' || apiStatus === 'FAILED' || authFailed) {
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

  // Loading skeleton
  if (apiStatus !== 'LOADED') {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-default relative ${className}`}
        style={{ height }}
      >
        <div className="absolute inset-0 bg-surface animate-pulse" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-muted font-medium">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
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
        clickableIcons={false}
        style={{ width: '100%', height: '100%' }}
      />

      {/* CSS overlay pin — same pattern as ImmersiveLocationMap */}
      <div
        className="absolute top-1/2 left-1/2 z-10 pointer-events-none"
        style={{ transform: 'translate(-50%, -100%)' }}
      >
        <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
          <path
            d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
            fill="var(--color-primary)"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
          />
          <circle cx="14" cy="13" r="5.5" fill="white" />
          <circle cx="14" cy="13" r="2.5" fill="var(--color-primary)" />
        </svg>
      </div>

      {/* Address bar */}
      {address && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border-t border-default">
          <p className="text-[11px] text-secondary font-medium truncate min-w-0 flex-1">
            {address}
          </p>
        </div>
      )}

      {/* Directions button */}
      {showDirectionsLink && (
        <button
          type="button"
          onClick={onDirections}
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
  )
}
