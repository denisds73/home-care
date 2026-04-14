import type { Booking, BookingStatus } from './domain'

export type DelayType = 'running_late' | 'cannot_attend'

export type DelayReason =
  | 'traffic'
  | 'previous_job_overran'
  | 'vehicle_issue'
  | 'personal_emergency'
  | 'sick'
  | 'vehicle_breakdown'
  | 'scheduling_conflict'
  | 'weather'
  | 'parts_unavailable'
  | 'other'

export type ClientDelayResponse =
  | 'pending'
  | 'accepted'
  | 'reschedule_requested'
  | 'cancelled'

export type DelayReporterRole = 'technician' | 'vendor' | 'admin'

export interface DelayEvent {
  id: string
  booking_id: string
  delay_type: DelayType
  reason: DelayReason
  reason_note: string | null
  revised_eta: string | null
  original_eta: string
  reported_by_user_id: string
  reported_by_role: DelayReporterRole
  client_response: ClientDelayResponse | null
  client_responded_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReportDelayPayload {
  delay_type: DelayType
  reason: DelayReason
  reason_note?: string
  revised_eta?: string
}

export interface RespondToDelayPayload {
  response: ClientDelayResponse
}

export type RescheduleStatus =
  | 'proposed'
  | 'accepted'
  | 'rejected'
  | 'counter_proposed'
  | 'expired'
  | 'auto_confirmed'

export type RescheduleInitiator = 'client' | 'vendor' | 'technician' | 'admin'

export interface RescheduleRequest {
  id: string
  booking_id: string
  initiated_by_user_id: string
  initiated_by_role: RescheduleInitiator
  reason: DelayReason
  reason_note: string | null
  original_date: string
  original_time_slot: string
  proposed_date: string
  proposed_time_slot: string
  status: RescheduleStatus
  responded_by_user_id: string | null
  responded_by_role: string | null
  counter_date: string | null
  counter_time_slot: string | null
  expires_at: string
  reschedule_number: number
  created_at: string
  updated_at: string
}

export type DisplayStatus =
  | BookingStatus
  | 'delayed'
  | 'cannot_attend'
  | 'rescheduling'
  | 'rescheduled'

export interface BookingWithDelay extends Booking {
  active_delay: DelayEvent | null
  active_reschedule: RescheduleRequest | null
  delay_events: DelayEvent[]
  reschedule_requests: RescheduleRequest[]
  reschedule_count: number
}
