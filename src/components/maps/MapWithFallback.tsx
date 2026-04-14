import { memo, type ReactNode } from 'react'
import { useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'

interface MapWithFallbackProps {
  lat: number
  lng: number
  address?: string
  height: string
  interactive?: boolean
  showDirectionsLink?: boolean
  children: ReactNode
  className?: string
}

/**
 * Wrapper that detects Google Maps API loading failures and renders
 * an OpenStreetMap embed as a fully functional fallback.
 */
export const MapWithFallback = memo(function MapWithFallback({
  lat,
  lng,
  address,
  height,
  interactive = false,
  showDirectionsLink = false,
  children,
  className = '',
}: MapWithFallbackProps) {
  const apiStatus = useApiLoadingStatus()

  // No key, or API failed to load → use OSM embed
  if (
    !ENV.GOOGLE_PLACES_KEY ||
    apiStatus === 'AUTH_FAILURE' ||
    apiStatus === 'FAILED'
  ) {
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

  // Google API loaded successfully — render real Google map
  return <>{children}</>
})

/* ── OpenStreetMap embed fallback ─────────────────────────────── */

interface OsmMapEmbedProps {
  lat: number
  lng: number
  address?: string
  height: string
  interactive?: boolean
  showDirectionsLink?: boolean
  className?: string
}

/** Real, interactive map embed using OpenStreetMap — no API key needed. */
export const OsmMapEmbed = memo(function OsmMapEmbed({
  lat,
  lng,
  address,
  height,
  interactive = false,
  showDirectionsLink = false,
  className = '',
}: OsmMapEmbedProps) {
  // Bounding box for the embed (approx. zoom level 16)
  const delta = 0.005
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const markerParam = `${lat},${lng}`

  // OSM embed URL with marker
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markerParam}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || `${lat},${lng}`)}`
  const osmViewUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`

  return (
    <div
      className={`overflow-hidden rounded-xl border border-default shadow-sm relative ${className}`}
      style={{ height }}
    >
      <iframe
        title="Service location map"
        src={embedUrl}
        className="w-full h-full border-0"
        style={{
          pointerEvents: interactive ? 'auto' : 'none',
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Bottom bar with address + actions */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border-t border-default">
        {address ? (
          <p className="text-[11px] text-secondary font-medium truncate min-w-0 flex-1">
            {address}
          </p>
        ) : (
          <a
            href={osmViewUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-brand font-semibold hover:underline"
          >
            View larger map
          </a>
        )}

        {showDirectionsLink && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-white text-[11px] font-semibold hover:opacity-90 transition shrink-0"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Directions
          </a>
        )}
      </div>
    </div>
  )
})
