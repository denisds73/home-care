/**
 * Contact utilities for phone formatting and WhatsApp deep-linking.
 *
 * All phone numbers in this app are 10-digit Indian mobile numbers
 * stored without country code. These helpers normalise them for
 * tel: links and wa.me URLs.
 */

/** Strip non-digit characters and prepend +91 when needed. Returns null for empty/invalid input. */
export function formatPhoneForTel(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 0) return null
  // Already includes country code (91 + 10 digits)
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
  // Raw 10-digit Indian number
  if (digits.length === 10) return `+91${digits}`
  // Fallback — return as-is with + prefix
  return `+${digits}`
}

/** Build a wa.me deep-link with pre-filled message. Returns null if phone is invalid. */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const formatted = formatPhoneForTel(phone)
  if (!formatted) return null
  // wa.me expects digits only (no + sign)
  const digits = formatted.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Default WhatsApp message template with booking context. */
export function whatsAppMessage(
  serviceName: string,
  bookingId: string,
): string {
  return `Hi, I have a query regarding my booking for ${serviceName} (Ref: #${bookingId.slice(0, 8)}).`
}
