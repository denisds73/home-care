interface LogoProps {
  className?: string
  /**
   * When true, the wordmark uses currentColor so the logo adapts to dark
   * backgrounds. When false (default), it renders in brand violet. The tile
   * mark (violet tile + white W-stroke + gold sorted-tick) is unchanged.
   */
  adaptive?: boolean
}

const VIOLET = '#6D28D9'
const GOLD = '#D4A017'

export function Logo({ className, adaptive = false }: LogoProps) {
  const wordFill = adaptive ? 'currentColor' : VIOLET
  return (
    <svg
      className={className}
      viewBox="0 0 280 56"
      fill="none"
      role="img"
      aria-label="WeSorters"
    >
      <rect x="4" y="6" width="44" height="44" rx="10" fill={VIOLET} />
      <path
        d="M11 18 L20 36 L26 27 L32 38"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 38 L42 16"
        fill="none"
        stroke={GOLD}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="62"
        y="37"
        fontFamily="'Lexend', 'Manrope', 'Helvetica Neue', Arial, sans-serif"
        fontSize="26"
        letterSpacing="-0.8"
        fill={wordFill}
      >
        <tspan fontWeight="500">We</tspan>
        <tspan fill={GOLD} fontWeight="800" dx="1">
          ·
        </tspan>
        <tspan fontWeight="800" dx="1">
          Sorters
        </tspan>
      </text>
    </svg>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 52 52"
      fill="none"
      role="img"
      aria-label="WeSorters"
    >
      <rect x="4" y="4" width="44" height="44" rx="10" fill={VIOLET} />
      <path
        d="M11 16 L20 34 L26 25 L32 36"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 36 L42 14"
        fill="none"
        stroke={GOLD}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
