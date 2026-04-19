export const SITE_NAME = 'HomeCare'

/** Public tagline used in meta descriptions and Open Graph text. */
export const SITE_TAGLINE = 'Premium Home Appliance Services'

export const DEFAULT_DESCRIPTION =
  'Book trusted technicians for AC, TV, fridge, microwave, and water purifier services. Transparent pricing, fast scheduling, and quality you can trust.'

export const DEFAULT_KEYWORDS =
  'home appliance repair, AC service, TV repair, fridge repair, microwave service, water purifier service, appliance technician'

/** Served from /public; safe for og:image and social cards (absolute URL added at runtime). */
export const DEFAULT_OG_IMAGE_PATH = '/favicon.svg'

/** Theme primary from design tokens — used for mobile browser chrome. */
export const THEME_COLOR = '#6D28D9'

export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function absoluteUrl(path: string): string {
  const base = getSiteOrigin()
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}
