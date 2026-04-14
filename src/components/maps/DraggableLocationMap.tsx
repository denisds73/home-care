import { memo, useCallback, useState } from 'react'
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'
import { MapWithFallback, OsmMapEmbed } from './MapWithFallback'

interface DraggableLocationMapProps {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
  height?: string
  className?: string
}

/** Animated draggable pin with drag-lift effect. */
function DraggablePin({ isDragging }: { isDragging: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-200"
      style={{ transform: isDragging ? 'scale(1.15) translateY(-8px)' : 'scale(1) translateY(0)' }}
    >
      {/* Shadow beneath pin */}
      <div
        className="absolute -bottom-1 w-6 h-2 rounded-full bg-black/15 transition-all duration-200"
        style={{
          transform: isDragging ? 'scale(1.4)' : 'scale(1)',
          opacity: isDragging ? 0.1 : 0.2,
        }}
      />
      {/* Pin body */}
      <svg width="36" height="48" viewBox="0 0 32 42" fill="none">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
          fill="var(--color-primary)"
          style={{
            filter: isDragging
              ? 'drop-shadow(0 4px 8px rgba(109, 40, 217, 0.4))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
        <circle cx="16" cy="16" r="7" fill="white" />
        <circle cx="16" cy="16" r="4" fill="var(--color-primary)" />
      </svg>
    </div>
  )
}

/**
 * Interactive map with a draggable pin for location selection.
 * Falls back to an OSM static embed when Google isn't available.
 */
export const DraggableLocationMap = memo(function DraggableLocationMap({
  lat,
  lng,
  onLocationChange,
  height = '250px',
  className = '',
}: DraggableLocationMapProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      setIsDragging(false)
      const pos = e.latLng
      if (pos) {
        onLocationChange(pos.lat(), pos.lng())
      }
    },
    [onLocationChange],
  )

  const handleMapClick = useCallback(
    (e: { detail: { latLng?: google.maps.LatLngLiteral | null } }) => {
      const latLng = e.detail.latLng
      if (latLng) {
        onLocationChange(latLng.lat, latLng.lng)
      }
    },
    [onLocationChange],
  )

  // No API key — show OSM static embed (pin dragging not available, but map is visible)
  if (!ENV.GOOGLE_PLACES_KEY) {
    return (
      <OsmMapEmbed
        lat={lat}
        lng={lng}
        height={height}
        className={className}
      />
    )
  }

  return (
    <MapWithFallback lat={lat} lng={lng} height={height} className={className}>
      <div
        className={`overflow-hidden rounded-xl border border-default shadow-sm relative ${className}`}
        style={{ height }}
      >
        <Map
          center={{ lat, lng }}
          zoom={15}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          colorScheme="LIGHT"
          onClick={handleMapClick}
        >
          <AdvancedMarker
            position={{ lat, lng }}
            draggable
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <DraggablePin isDragging={isDragging} />
          </AdvancedMarker>
        </Map>

        {/* Instruction overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-default shadow-sm pointer-events-none">
          <p className="text-[10px] font-medium text-muted whitespace-nowrap">
            Drag the pin or tap to set location
          </p>
        </div>
      </div>
    </MapWithFallback>
  )
})
