/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical site origin for SEO / Open Graph (e.g. https://www.example.com). No trailing slash. */
  readonly VITE_SITE_URL?: string
}
