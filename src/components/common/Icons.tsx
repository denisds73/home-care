import { memo } from 'react'

interface IconProps {
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  'aria-label'?: string
}

const icon = (path: string, displayName: string) => {
  const Icon = memo(({ className = '', ...rest }: IconProps) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d={path} />
    </svg>
  ))
  Icon.displayName = displayName
  return Icon
}

const multiIcon = (paths: string[], displayName: string) => {
  const Icon = memo(({ className = '', ...rest }: IconProps) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  ))
  Icon.displayName = displayName
  return Icon
}

export const GridIcon = multiIcon(
  ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  'GridIcon',
)

export const BriefcaseIcon = multiIcon(
  [
    'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z',
    'M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
  ],
  'BriefcaseIcon',
)

export const DollarIcon = multiIcon(
  ['M12 1v22', 'M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'],
  'DollarIcon',
)

export const CalendarIcon = multiIcon(
  [
    'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z',
    'M16 2v4M8 2v4M3 10h18',
  ],
  'CalendarIcon',
)

export const UserIcon = multiIcon(
  [
    'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2',
    'M12 3a4 4 0 100 8 4 4 0 000-8z',
  ],
  'UserIcon',
)

export const UsersIcon = multiIcon(
  [
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
    'M9 3a4 4 0 100 8 4 4 0 000-8z',
    'M23 21v-2a4 4 0 00-3-3.87',
    'M16 3.13a4 4 0 010 7.75',
  ],
  'UsersIcon',
)

export const HelpIcon = multiIcon(
  [
    'M12 2a10 10 0 100 20 10 10 0 000-20z',
    'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3',
    'M12 17h.01',
  ],
  'HelpIcon',
)

export const ClipboardIcon = multiIcon(
  [
    'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2',
    'M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z',
  ],
  'ClipboardIcon',
)

export const PackageIcon = multiIcon(
  [
    'M16.5 9.4l-9-5.19',
    'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
    'M3.27 6.96L12 12.01l8.73-5.05',
    'M12 22.08V12',
  ],
  'PackageIcon',
)

export const WrenchIcon = icon(
  'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  'WrenchIcon',
)

export const WalletIcon = multiIcon(
  [
    'M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4',
    'M4 6v12a2 2 0 002 2h14V12',
    'M18 12a2 2 0 100 4 2 2 0 000-4z',
  ],
  'WalletIcon',
)

export const SettingsIcon = multiIcon(
  [
    'M12 15a3 3 0 100-6 3 3 0 000 6z',
    'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  ],
  'SettingsIcon',
)

/* ─── Category Appliance Icons (detailed illustrative SVGs) ─── */

// Split AC wall unit — body with louver vents, LED indicator, air flow curves
export const SnowflakeIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Wall mount bracket */}
    <rect x="18" y="8" width="28" height="3" rx="1" fill="currentColor" opacity=".12" />
    {/* Main unit body */}
    <rect x="6" y="11" width="52" height="28" rx="4" fill="currentColor" opacity=".08" />
    <rect x="6" y="11" width="52" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
    {/* Front panel inset */}
    <rect x="10" y="15" width="44" height="16" rx="2" fill="currentColor" opacity=".05" />
    {/* Louver vents */}
    <line x1="12" y1="20" x2="52" y2="20" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
    <line x1="12" y1="24" x2="52" y2="24" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
    <line x1="12" y1="28" x2="52" y2="28" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
    {/* LED indicator */}
    <circle cx="50" cy="35" r="1.5" fill="currentColor" opacity=".7" />
    {/* Air flow curves below unit */}
    <path d="M20 42c4 4 8 2 12 4s8 0 12-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
    <path d="M22 47c3 3 7 1.5 10 3.5s7 0 10-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".2" />
  </svg>
))
SnowflakeIcon.displayName = 'SnowflakeIcon'

// Flat-screen LED TV — thin bezel, screen reflection, stand base
export const TvIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Screen body */}
    <rect x="4" y="8" width="56" height="34" rx="3" fill="currentColor" opacity=".08" />
    <rect x="4" y="8" width="56" height="34" rx="3" stroke="currentColor" strokeWidth="2.5" />
    {/* Screen inset */}
    <rect x="7" y="11" width="50" height="28" rx="1.5" fill="currentColor" opacity=".06" />
    {/* Screen reflection */}
    <path d="M10 14l14-2v5L10 19z" fill="currentColor" opacity=".06" />
    {/* Bottom bezel brand mark */}
    <circle cx="32" cy="39.5" r="1" fill="currentColor" opacity=".3" />
    {/* Stand neck */}
    <rect x="28" y="42" width="8" height="6" rx="1" fill="currentColor" opacity=".15" />
    <rect x="28" y="42" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    {/* Stand base */}
    <rect x="18" y="48" width="28" height="4" rx="2" fill="currentColor" opacity=".12" />
    <rect x="18" y="48" width="28" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
))
TvIcon.displayName = 'TvIcon'

// Double-door refrigerator — freezer top, fridge bottom, handles, dispenser
export const ThermometerIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Main body */}
    <rect x="12" y="3" width="40" height="55" rx="4" fill="currentColor" opacity=".08" />
    <rect x="12" y="3" width="40" height="55" rx="4" stroke="currentColor" strokeWidth="2.5" />
    {/* Freezer/fridge divider */}
    <line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" strokeWidth="2" />
    {/* Door split line (double door top) */}
    <line x1="32" y1="3" x2="32" y2="22" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
    {/* Freezer handles */}
    <rect x="27" y="10" width="1.5" height="8" rx=".75" fill="currentColor" opacity=".5" />
    <rect x="35.5" y="10" width="1.5" height="8" rx=".75" fill="currentColor" opacity=".5" />
    {/* Fridge handle */}
    <rect x="46" y="28" width="2" height="18" rx="1" fill="currentColor" opacity=".5" />
    {/* Dispenser area */}
    <rect x="16" y="8" width="8" height="6" rx="1.5" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1" strokeOpacity=".3" />
    {/* Temperature display */}
    <rect x="19" y="26" width="10" height="4" rx="1" fill="currentColor" opacity=".1" />
    {/* Feet */}
    <rect x="15" y="58" width="4" height="3" rx="1" fill="currentColor" opacity=".25" />
    <rect x="45" y="58" width="4" height="3" rx="1" fill="currentColor" opacity=".25" />
  </svg>
))
ThermometerIcon.displayName = 'ThermometerIcon'

// RO Water Purifier — tank body, tap, filter indicators, brand panel
export const DropletIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Main body */}
    <rect x="12" y="4" width="40" height="50" rx="5" fill="currentColor" opacity=".08" />
    <rect x="12" y="4" width="40" height="50" rx="5" stroke="currentColor" strokeWidth="2.5" />
    {/* Top panel / brand area */}
    <rect x="12" y="4" width="40" height="14" rx="5" fill="currentColor" opacity=".1" />
    <line x1="12" y1="18" x2="52" y2="18" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
    {/* Display / indicators */}
    <rect x="20" y="8" width="24" height="6" rx="2" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1" strokeOpacity=".3" />
    {/* Filter status LEDs */}
    <circle cx="26" cy="11" r="1.5" fill="currentColor" opacity=".5" />
    <circle cx="32" cy="11" r="1.5" fill="currentColor" opacity=".3" />
    <circle cx="38" cy="11" r="1.5" fill="currentColor" opacity=".3" />
    {/* Water level window */}
    <rect x="18" y="24" width="8" height="20" rx="2" fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".3" />
    <rect x="18" y="34" width="8" height="10" rx="0" fill="currentColor" opacity=".08" />
    {/* Tap/spigot */}
    <rect x="38" y="34" width="8" height="3" rx="1" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M42 37v5h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="44" r="1.5" fill="currentColor" opacity=".3" />
    {/* Base */}
    <rect x="14" y="54" width="36" height="4" rx="2" fill="currentColor" opacity=".12" />
  </svg>
))
DropletIcon.displayName = 'DropletIcon'

// Microwave Oven — door with glass window, handle, control panel with dial and buttons
export const MicrowaveIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Main body */}
    <rect x="4" y="12" width="56" height="38" rx="4" fill="currentColor" opacity=".08" />
    <rect x="4" y="12" width="56" height="38" rx="4" stroke="currentColor" strokeWidth="2.5" />
    {/* Glass door window */}
    <rect x="8" y="16" width="34" height="30" rx="2.5" fill="currentColor" opacity=".06" />
    <rect x="8" y="16" width="34" height="30" rx="2.5" stroke="currentColor" strokeWidth="2" />
    {/* Door inner glass */}
    <rect x="11" y="19" width="28" height="24" rx="1.5" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeWidth="1" strokeOpacity=".2" />
    {/* Turntable plate inside */}
    <ellipse cx="25" cy="38" rx="8" ry="2" fill="currentColor" opacity=".1" />
    {/* Food plate hint */}
    <rect x="20" y="32" width="10" height="4" rx="2" fill="currentColor" opacity=".08" />
    {/* Door handle */}
    <rect x="43" y="22" width="2" height="20" rx="1" fill="currentColor" opacity=".4" />
    {/* Control panel area */}
    <rect x="48" y="16" width="9" height="30" rx="1.5" fill="currentColor" opacity=".06" />
    {/* Timer dial */}
    <circle cx="52.5" cy="24" r="4" fill="currentColor" opacity=".08" stroke="currentColor" strokeWidth="1.5" />
    <line x1="52.5" y1="24" x2="52.5" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Buttons */}
    <rect x="50" y="32" width="5" height="2.5" rx="1" fill="currentColor" opacity=".2" />
    <rect x="50" y="36.5" width="5" height="2.5" rx="1" fill="currentColor" opacity=".15" />
    <rect x="50" y="41" width="5" height="2.5" rx="1" fill="currentColor" opacity=".15" />
    {/* Feet */}
    <rect x="8" y="50" width="6" height="2.5" rx="1" fill="currentColor" opacity=".2" />
    <rect x="50" y="50" width="6" height="2.5" rx="1" fill="currentColor" opacity=".2" />
  </svg>
))
MicrowaveIcon.displayName = 'MicrowaveIcon'

// Front-load Washing Machine — drum door, control panel, detergent drawer, rubber gasket
export const WashingMachineIcon = memo(({ className = '', ...rest }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
    {/* Main body */}
    <rect x="8" y="4" width="48" height="54" rx="4" fill="currentColor" opacity=".08" />
    <rect x="8" y="4" width="48" height="54" rx="4" stroke="currentColor" strokeWidth="2.5" />
    {/* Control panel strip */}
    <rect x="8" y="4" width="48" height="14" rx="4" fill="currentColor" opacity=".1" />
    <line x1="8" y1="18" x2="56" y2="18" stroke="currentColor" strokeWidth="2" />
    {/* Detergent drawer */}
    <rect x="13" y="7" width="12" height="5" rx="1.5" fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".4" />
    {/* Control dial */}
    <circle cx="42" cy="11" r="4.5" fill="currentColor" opacity=".06" stroke="currentColor" strokeWidth="1.5" />
    <line x1="42" y1="11" x2="42" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Power button */}
    <circle cx="52" cy="11" r="2" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1" />
    {/* Drum door — outer ring (rubber gasket) */}
    <circle cx="32" cy="38" r="16" fill="currentColor" opacity=".05" />
    <circle cx="32" cy="38" r="16" stroke="currentColor" strokeWidth="2.5" />
    {/* Door glass */}
    <circle cx="32" cy="38" r="12" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".4" />
    {/* Inner drum perforations (subtle detail) */}
    <circle cx="32" cy="38" r="8" stroke="currentColor" strokeWidth="1" opacity=".15" strokeDasharray="2 3" />
    {/* Drum lifters / paddles */}
    <line x1="27" y1="33" x2="30" y2="36" stroke="currentColor" strokeWidth="1.2" opacity=".25" strokeLinecap="round" />
    <line x1="37" y1="40" x2="34" y2="43" stroke="currentColor" strokeWidth="1.2" opacity=".25" strokeLinecap="round" />
    {/* Door handle */}
    <rect x="44" y="36" width="5" height="3" rx="1.5" fill="currentColor" opacity=".3" />
    {/* Feet */}
    <rect x="12" y="58" width="5" height="3" rx="1.5" fill="currentColor" opacity=".2" />
    <rect x="47" y="58" width="5" height="3" rx="1.5" fill="currentColor" opacity=".2" />
  </svg>
))
WashingMachineIcon.displayName = 'WashingMachineIcon'

/* ─── Payment Icons ─── */

export const SmartphoneIcon = multiIcon(
  [
    'M11 5h2',
    'M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z',
  ],
  'SmartphoneIcon',
)

export const CreditCardIcon = multiIcon(
  [
    'M1 10h22',
    'M3 4h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z',
  ],
  'CreditCardIcon',
)

export const BankIcon = multiIcon(
  [
    'M3 21h18',
    'M3 10h18',
    'M5 6l7-3 7 3',
    'M4 10v11',
    'M20 10v11',
    'M8 14v3',
    'M12 14v3',
    'M16 14v3',
  ],
  'BankIcon',
)

/* ─── Empty State Icons ─── */

export const CalendarDaysIcon = multiIcon(
  [
    'M8 2v4',
    'M16 2v4',
    'M3 10h18',
    'M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    'M8 14h.01',
    'M12 14h.01',
    'M16 14h.01',
    'M8 18h.01',
    'M12 18h.01',
  ],
  'CalendarDaysIcon',
)

export const BanIcon = multiIcon(
  [
    'M12 2a10 10 0 100 20 10 10 0 000-20z',
    'M4.93 4.93l14.14 14.14',
  ],
  'BanIcon',
)

export const BellIcon = multiIcon(
  [
    'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9',
    'M13.73 21a2 2 0 01-3.46 0',
  ],
  'BellIcon',
)

export const CheckCircleIcon = multiIcon(
  [
    'M22 11.08V12a10 10 0 11-5.93-9.14',
    'M22 4L12 14.01l-3-3',
  ],
  'CheckCircleIcon',
)
