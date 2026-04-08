import type { VendorStatus } from '../types/domain'

export function vendorStatusBadgeClass(status: VendorStatus): string {
  switch (status) {
    case 'active':
      return 'badge badge-completed'
    case 'pending':
      return 'badge badge-pending'
    case 'suspended':
      return 'badge badge-cancelled'
    case 'rejected':
    default:
      return 'badge'
  }
}
