import type { Service } from '../types/domain'
import { CATEGORY_IMAGES } from './categories'

/**
 * Per-service hero images under /public/images/services/.
 * Mapped to DB service IDs from the seed migration.
 */
export const SERVICE_IMAGE_BY_ID: Record<number, string> = {
  // AC
  1: '/images/services/ac/01-gas-refill.jpg',
  2: '/images/services/ac/02-deep-clean.jpg',
  3: '/images/services/ac/03-installation.jpg',
  4: '/images/services/ac/04-compressor-repair.jpg',
  // TV
  5: '/images/services/tv/05-wall-mounting.jpg',
  6: '/images/services/tv/06-screen-repair.jpg',
  7: '/images/services/tv/07-motherboard-repair.jpg',
  8: '/images/services/tv/08-general-checkup.jpg',
  // Refrigerator
  9: '/images/services/refrigerator/09-gas-charging.jpg',
  10: '/images/services/refrigerator/10-thermostat.jpg',
  11: '/images/services/refrigerator/11-door-seal.jpg',
  12: '/images/services/refrigerator/12-compressor.jpg',
  // Microwave
  13: '/images/services/microwave/13-magnetron.jpg',
  14: '/images/services/microwave/14-turntable.jpg',
  15: '/images/services/microwave/15-general.jpg',
  16: '/images/services/microwave/16-control-panel.jpg',
  // Water Purifier
  17: '/images/services/water-purifier/17-filter.jpg',
  18: '/images/services/water-purifier/18-maintenance.jpg',
  19: '/images/services/water-purifier/19-ro-install.jpg',
  20: '/images/services/water-purifier/20-uv-lamp.jpg',
  // Washing Machine
  21: '/images/services/washing-machine/21-drum-clean.jpg',
  22: '/images/services/washing-machine/22-motor.jpg',
  23: '/images/services/washing-machine/23-drain-pump.jpg',
  24: '/images/services/washing-machine/24-pcb.jpg',
}

export function getServiceImage(service: Service): string {
  if (service.image_url) return service.image_url
  const byId = SERVICE_IMAGE_BY_ID[service.id]
  if (byId) return byId
  return CATEGORY_IMAGES[service.category] ?? ''
}
