import { memo, useState, useRef, useCallback, useEffect } from 'react'
import { Map, useMap, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'
import { useGoogleMapsAuthFailure } from './MapWithFallback'

interface ImmersiveLocationMapProps {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
  onDragStateChange?: (isDragging: boolean) => void
  className?: string
}

/* ── Fixed center pin ── */

function CenterPin({ isDragging }: { isDragging: boolean }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 z-10 pointer-events-none"
      style={{ transform: 'translate(-50%, -100%)' }}
    >
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: isDragging ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
        }}
      >
        <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
          <path
            d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
            fill="var(--color-primary)"
            style={{
              filter: isDragging
                ? 'drop-shadow(0 4px 10px rgba(109, 40, 217, 0.4))'
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
              transition: 'filter 0.2s ease',
            }}
          />
          <circle cx="14" cy="13" r="5.5" fill="white" />
          <circle cx="14" cy="13" r="2.5" fill="var(--color-primary)" />
        </svg>
      </div>
      <div
        className="absolute left-1/2 transition-all duration-200 ease-out rounded-full bg-black/20"
        style={{
          width: isDragging ? '14px' : '10px',
          height: isDragging ? '5px' : '4px',
          bottom: isDragging ? '-12px' : '-3px',
          transform: 'translateX(-50%)',
          opacity: isDragging ? 0.12 : 0.25,
        }}
      />
    </div>
  )
}

/*
 * Swiggy/Zomato/Uber pattern for center-pin location picking:
 *
 * 1. Register native Google Maps listeners via map.addListener() — NOT React props.
 *    React synthetic events from @vis.gl can be unreliable for this pattern.
 *
 * 2. Use 'dragstart' to lift the pin and mark that user interacted.
 *
 * 3. Use 'idle' (NOT 'dragend') to detect when the map has fully settled
 *    after any movement — drag, momentum, pinch-zoom, double-tap.
 *    'idle' fires exactly once when all animations complete.
 *
 * 4. On 'idle', read map.getCenter() and fire onLocationChange.
 *
 * 5. Track a 'userDragged' flag to skip the initial 'idle' on mount
 *    and any programmatic panTo() calls.
 */
function MapEventBridge({
  onLocationChange,
  onDragStateChange,
  onDraggingChange,
}: {
  onLocationChange: (lat: number, lng: number) => void
  onDragStateChange?: (isDragging: boolean) => void
  onDraggingChange: (v: boolean) => void
}) {
  const map = useMap()
  // Refs for callbacks to avoid re-registering listeners when callbacks change
  const onLocationChangeRef = useRef(onLocationChange)
  const onDragStateChangeRef = useRef(onDragStateChange)
  const onDraggingChangeRef = useRef(onDraggingChange)

  useEffect(() => { onLocationChangeRef.current = onLocationChange }, [onLocationChange])
  useEffect(() => { onDragStateChangeRef.current = onDragStateChange }, [onDragStateChange])
  useEffect(() => { onDraggingChangeRef.current = onDraggingChange }, [onDraggingChange])

  useEffect(() => {
    if (!map) return

    let userDragged = false

    const dragStartListener = map.addListener('dragstart', () => {
      userDragged = true
      onDraggingChangeRef.current(true)
      onDragStateChangeRef.current?.(true)
    })

    const idleListener = map.addListener('idle', () => {
      if (!userDragged) return // skip mount idle and programmatic pans
      userDragged = false // reset so next idle without drag is skipped

      onDraggingChangeRef.current(false)
      onDragStateChangeRef.current?.(false)

      const center = map.getCenter()
      if (center) {
        onLocationChangeRef.current(center.lat(), center.lng())
      }
    })

    return () => {
      dragStartListener.remove()
      idleListener.remove()
    }
  }, [map]) // Only depends on the map instance — registered once

  return null
}

/**
 * Programmatically pans the map when lat/lng props change significantly.
 */
function MapPanner({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const prevRef = useRef({ lat, lng })

  useEffect(() => {
    if (!map) return
    const dLat = Math.abs(prevRef.current.lat - lat)
    const dLng = Math.abs(prevRef.current.lng - lng)
    if (dLat < 0.0001 && dLng < 0.0001) return
    prevRef.current = { lat, lng }
    map.panTo({ lat, lng })
  }, [map, lat, lng])

  return null
}

/* ── Google Maps implementation ── */

function GoogleImmersiveMap({
  lat,
  lng,
  onLocationChange,
  onDragStateChange,
  className = '',
}: ImmersiveLocationMapProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDraggingChange = useCallback((v: boolean) => {
    setIsDragging(v)
  }, [])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Map
        defaultCenter={{ lat, lng }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        colorScheme="LIGHT"
        clickableIcons={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapEventBridge
          onLocationChange={onLocationChange}
          onDragStateChange={onDragStateChange}
          onDraggingChange={handleDraggingChange}
        />
        <MapPanner lat={lat} lng={lng} />
      </Map>
      <CenterPin isDragging={isDragging} />
    </div>
  )
}

/* ── OSM fallback ── */

function OsmImmersiveMap({
  lat,
  lng,
  onLocationChange,
  className = '',
}: Omit<ImmersiveLocationMapProps, 'onDragStateChange'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const delta = 0.008
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const markerParam = `${lat},${lng}`
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markerParam}`

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const lngFraction = clickX / rect.width
      const latFraction = 1 - clickY / rect.height
      const newLat = (lat - delta) + latFraction * (2 * delta)
      const newLng = (lng - delta) + lngFraction * (2 * delta)
      onLocationChange(newLat, newLng)
    },
    [lat, lng, onLocationChange],
  )

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <iframe
        title="Service location map"
        src={embedUrl}
        className="w-full h-full border-0"
        style={{ pointerEvents: 'none' }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div
        className="absolute inset-0 cursor-crosshair z-[1]"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onLocationChange(lat, lng)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Tap on the map to set location"
      />
      <CenterPin isDragging={false} />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-default shadow-sm pointer-events-none z-10">
        <p className="text-[10px] font-medium text-muted whitespace-nowrap">
          Tap on the map to adjust location
        </p>
      </div>
    </div>
  )
}

/* ── Loading skeleton ── */

function MapSkeleton() {
  return (
    <div className="relative w-full h-full bg-surface">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 to-muted/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-[2.5px] border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted font-medium">Loading map&hellip;</p>
      </div>
      <CenterPin isDragging={false} />
    </div>
  )
}

/* ── Main export ── */

export const ImmersiveLocationMap = memo(function ImmersiveLocationMap(
  props: ImmersiveLocationMapProps,
) {
  const apiStatus = useApiLoadingStatus()
  const authFailed = useGoogleMapsAuthFailure()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (apiStatus === 'LOADED') {
      setTimedOut(false)
      return
    }
    if (!ENV.GOOGLE_PLACES_KEY) return
    const timer = setTimeout(() => setTimedOut(true), 6000)
    return () => clearTimeout(timer)
  }, [apiStatus])

  if (
    !ENV.GOOGLE_PLACES_KEY ||
    apiStatus === 'AUTH_FAILURE' ||
    apiStatus === 'FAILED' ||
    authFailed ||
    timedOut
  ) {
    return <OsmImmersiveMap {...props} />
  }

  if (apiStatus !== 'LOADED') {
    return <MapSkeleton />
  }

  return <GoogleImmersiveMap {...props} />
})
