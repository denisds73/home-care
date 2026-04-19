import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteOrigin,
} from '../config/site'

type RouteSeoResult = {
  title: string
  description: string
  robots: string
  ogImagePath: string
}

function upsertMetaName(name: string, content: string) {
  const existing = Array.from(document.head.querySelectorAll('meta')).find(
    (m) => m.getAttribute('name') === name,
  ) as HTMLMetaElement | undefined
  const el = existing ?? document.createElement('meta')
  if (!existing) {
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaProperty(property: string, content: string) {
  const existing = Array.from(document.head.querySelectorAll('meta')).find(
    (m) => m.getAttribute('property') === property,
  ) as HTMLMetaElement | undefined
  const el = existing ?? document.createElement('meta')
  if (!existing) {
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLinkRel(rel: string, href: string) {
  const existing = Array.from(document.head.querySelectorAll('link')).find(
    (l) => l.getAttribute('rel') === rel,
  ) as HTMLLinkElement | undefined
  const el = existing ?? document.createElement('link')
  if (!existing) {
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function marketingDefaults(): RouteSeoResult {
  return {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    robots: 'index,follow',
    ogImagePath: DEFAULT_OG_IMAGE_PATH,
  }
}

function resolveRouteSeo(pathname: string): RouteSeoResult {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (
    path.startsWith('/vendor') ||
    path.startsWith('/technician') ||
    path.startsWith('/admin')
  ) {
    const portal =
      path.startsWith('/vendor') ? 'Vendor' : path.startsWith('/technician') ? 'Technician' : 'Admin'
    return {
      title: `${portal} portal | ${SITE_NAME}`,
      description: `Sign in to the ${portal.toLowerCase()} portal for ${SITE_NAME}.`,
      robots: 'noindex,nofollow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (path.endsWith('/login')) {
    return {
      title: `Sign in | ${SITE_NAME}`,
      description: `Sign in to your ${SITE_NAME} account to manage bookings and services.`,
      robots: 'noindex,nofollow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (
    path.startsWith('/app/bookings') ||
    path === '/app/booking' ||
    path === '/app/profile'
  ) {
    return {
      title: `Your bookings | ${SITE_NAME}`,
      description: `Manage your appliance service bookings with ${SITE_NAME}.`,
      robots: 'noindex,nofollow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (path === '/app/wallet' || path === '/app/notifications') {
    return {
      title: `${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex,nofollow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (path.startsWith('/app/services/')) {
    return {
      title: `Services | ${SITE_NAME}`,
      description: `Browse appliance services and book a verified technician with ${SITE_NAME}.`,
      robots: 'index,follow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (path === '/app/support') {
    return {
      title: `Help & support | ${SITE_NAME}`,
      description: `Get help with your ${SITE_NAME} bookings, billing, and service requests.`,
      robots: 'index,follow',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    }
  }

  if (path === '/app') {
    return marketingDefaults()
  }

  if (path === '/') {
    return {
      ...marketingDefaults(),
      robots: 'noindex,nofollow',
    }
  }

  return marketingDefaults()
}

export function applyRouteSeo(pathname: string) {
  const origin = getSiteOrigin()
  const normalizedPath = pathname.split('?')[0]?.split('#')[0] ?? '/'
  const { title, description, robots, ogImagePath } = resolveRouteSeo(normalizedPath)

  document.title = title

  upsertMetaName('description', description)
  upsertMetaName('keywords', DEFAULT_KEYWORDS)
  upsertMetaName('robots', robots)

  const canonical = `${origin}${normalizedPath === '/' ? '' : normalizedPath}` || `${origin}/`
  upsertLinkRel('canonical', canonical)

  const ogImage = absoluteUrl(ogImagePath)

  upsertMetaProperty('og:type', 'website')
  upsertMetaProperty('og:site_name', SITE_NAME)
  upsertMetaProperty('og:title', title)
  upsertMetaProperty('og:description', description)
  upsertMetaProperty('og:url', canonical)
  upsertMetaProperty('og:image', ogImage)
  upsertMetaProperty('og:locale', 'en_US')

  upsertMetaName('twitter:card', 'summary_large_image')
  upsertMetaName('twitter:title', title)
  upsertMetaName('twitter:description', description)
  upsertMetaName('twitter:image', ogImage)
}
