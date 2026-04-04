import { memo } from 'react'

interface IconProps {
  className?: string
}

const icon = (path: string, displayName: string) => {
  const Icon = memo(({ className = '' }: IconProps) => (
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
    >
      <path d={path} />
    </svg>
  ))
  Icon.displayName = displayName
  return Icon
}

const multiIcon = (paths: string[], displayName: string) => {
  const Icon = memo(({ className = '' }: IconProps) => (
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
