import type { CSSProperties } from 'react'
import LogoSvg from '../../assets/logo.svg?react'
import LogoMarkSvg from '../../assets/logo-mark.svg?react'

interface LogoProps {
  className?: string
  /**
   * When true, the wordmark inherits color from the parent via currentColor so
   * the logo adapts to dark backgrounds. When false (default), it renders in
   * brand violet. The tile mark (violet tile + white W-stroke + gold tick) is
   * unchanged.
   */
  adaptive?: boolean
}

const VIOLET = '#6D28D9'

export function Logo({ className, adaptive = false }: LogoProps) {
  const style: CSSProperties | undefined = adaptive
    ? undefined
    : { color: VIOLET }
  return <LogoSvg className={className} style={style} />
}

export function LogoMark({ className }: { className?: string }) {
  return <LogoMarkSvg className={className} />
}
