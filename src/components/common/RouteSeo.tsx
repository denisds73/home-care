import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { THEME_COLOR } from '../../config/site'
import { applyRouteSeo } from '../../utils/seo'

function upsertThemeColor() {
  let el = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'theme-color')
    document.head.appendChild(el)
  }
  el.setAttribute('content', THEME_COLOR)
}

export default function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    upsertThemeColor()
    applyRouteSeo(pathname)
  }, [pathname])

  return null
}
