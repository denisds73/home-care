import { memo } from 'react'
import { PhoneIcon, WhatsAppIcon } from './Icons'
import {
  formatPhoneForTel,
  buildWhatsAppUrl,
  whatsAppMessage,
} from '../../utils/contact'

interface TechnicianContactButtonsProps {
  phone: string | null | undefined
  technicianName?: string | null
  serviceName: string
  bookingId: string
  /** Compact mode for inline card usage (list views) */
  compact?: boolean
}

/**
 * Premium contact strip for reaching an assigned technician.
 * Renders Call + WhatsApp as a unified pill with subtle tinted backgrounds.
 * Returns null when phone is unavailable — safe to render unconditionally.
 */
export const TechnicianContactButtons = memo(function TechnicianContactButtons({
  phone,
  technicianName,
  serviceName,
  bookingId,
  compact,
}: TechnicianContactButtonsProps) {
  const telUrl = formatPhoneForTel(phone)
  if (!telUrl) return null

  const label = technicianName ?? 'technician'
  const waUrl = buildWhatsAppUrl(phone, whatsAppMessage(serviceName, bookingId))

  const iconSize = compact ? 'w-[18px] h-[18px]' : 'w-5 h-5'
  const btnSize = compact
    ? 'min-w-[40px] min-h-[40px] p-2'
    : 'min-w-[44px] min-h-[44px] p-2.5'

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] overflow-hidden">
      {/* Call */}
      <a
        href={`tel:${telUrl}`}
        className={`inline-flex items-center justify-center ${btnSize} text-[var(--color-primary)] bg-[var(--color-primary-soft)] hover:bg-[#ddd6fe] transition-colors`}
        title={`Call ${label}`}
        aria-label={`Call ${label}`}
      >
        <PhoneIcon className={iconSize} />
      </a>

      {/* Divider */}
      <div className="w-px self-stretch bg-[var(--color-border)]" />

      {/* WhatsApp */}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center ${btnSize} text-[#25D366] bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors`}
          title={`WhatsApp ${label}`}
          aria-label={`WhatsApp ${label}`}
        >
          <WhatsAppIcon className={iconSize} />
        </a>
      )}
    </div>
  )
})
