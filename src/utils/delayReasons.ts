import type { DelayReason, DelayType } from '../types/delay'

export interface ReasonOption {
  value: DelayReason
  label: string
}

const ALL_REASONS: Record<DelayReason, string> = {
  traffic: 'Traffic',
  previous_job_overran: 'Previous job overran',
  vehicle_issue: 'Vehicle issue',
  personal_emergency: 'Personal emergency',
  sick: 'Sick',
  vehicle_breakdown: 'Vehicle breakdown',
  scheduling_conflict: 'Scheduling conflict',
  weather: 'Weather',
  parts_unavailable: 'Parts unavailable',
  other: 'Other',
}

const RUNNING_LATE_REASONS: DelayReason[] = [
  'traffic',
  'previous_job_overran',
  'vehicle_issue',
  'personal_emergency',
  'other',
]

const CANNOT_ATTEND_REASONS: DelayReason[] = [
  'sick',
  'vehicle_breakdown',
  'scheduling_conflict',
  'personal_emergency',
  'other',
]

const RESCHEDULE_REASONS: DelayReason[] = [
  'parts_unavailable',
  'scheduling_conflict',
  'weather',
  'other',
]

export function getReasonLabel(reason: DelayReason): string {
  return ALL_REASONS[reason]
}

export function getReasonsForType(
  delayType: DelayType | 'reschedule',
): ReasonOption[] {
  const keys =
    delayType === 'running_late'
      ? RUNNING_LATE_REASONS
      : delayType === 'cannot_attend'
        ? CANNOT_ATTEND_REASONS
        : RESCHEDULE_REASONS
  return keys.map((value) => ({ value, label: ALL_REASONS[value] }))
}
