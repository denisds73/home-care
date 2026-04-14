import { APIProvider } from '@vis.gl/react-google-maps'
import { ENV } from '../../config/env'
import type { ReactNode } from 'react'

interface GoogleMapsProviderProps {
  children: ReactNode
}

/**
 * Wraps children with the Google Maps APIProvider when an API key is configured.
 * The SDK only loads when a <Map> component actually mounts, so this has zero
 * cost on pages that don't use maps.
 */
export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  if (!ENV.GOOGLE_PLACES_KEY) {
    return <>{children}</>
  }

  return (
    <APIProvider apiKey={ENV.GOOGLE_PLACES_KEY}>
      {children}
    </APIProvider>
  )
}
