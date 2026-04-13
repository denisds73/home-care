# Service Delay Communication — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add delay reporting, client notification, and response flows to the booking system so technicians/vendors/admins can communicate delays and clients can respond (accept ETA, cancel).

**Architecture:** Overlay model — existing 7-state booking machine is untouched. Delay events are metadata on bookings. A pure `getDisplayStatus()` function computes the UI-facing status from booking + delay data. New components (DelayBanner, CriticalDelayModal, ReportDelaySheet) integrate into existing portal detail pages.

**Tech Stack:** React 19, TypeScript strict, Zustand, Tailwind CSS v4, Vite, Vitest + RTL

**Spec:** `docs/superpowers/specs/2026-04-13-service-delay-communication-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/types/delay.ts` | All delay/reschedule types: DelayEvent, DelayType, DelayReason, RescheduleRequest, DisplayStatus, BookingWithDelay |
| `src/utils/delayReasons.ts` | Reason constants, category-to-reasons mapping, human-readable labels |
| `src/utils/getDisplayStatus.ts` | Pure function: (booking, activeDelay, activeReschedule) => DisplayStatus |
| `src/services/delayService.ts` | API calls: reportDelay, updateDelay, respondToDelay, getDelayEvents |
| `src/hooks/useBookingPolling.ts` | Poll booking every 10s for today's bookings, visibility-aware |
| `src/components/delay/DelayReasonPicker.tsx` | Chip-based single-select reason selector |
| `src/components/delay/RevisedEtaPicker.tsx` | Time input for revised ETA |
| `src/components/delay/DelayBanner.tsx` | Inline alert banner (role-aware actions) |
| `src/components/delay/ReportDelaySheet.tsx` | Technician: reason + ETA + note form in a modal |
| `src/components/delay/CannotAttendSheet.tsx` | Technician: reason + required note form in a modal |
| `src/components/delay/CriticalDelayModal.tsx` | Client bottom sheet for cannot_attend events |
| `src/components/delay/index.ts` | Barrel export |

### Modified Files

| File | Change |
|------|--------|
| `src/types/domain.ts` | Re-export delay types, extend NotificationType |
| `src/data/helpers.ts` | Add `displayStatusLabel()` |
| `src/index.css` | Add 4 new badge classes |
| `src/components/bookings/StatusBadge.tsx` | Accept DisplayStatus, add 4 new variants |
| `src/components/bookings/StatusTimeline.tsx` | Render delay events with colored dots |
| `src/pages/technician/TechnicianJobDetailPage.tsx` | Add delay reporting buttons + integration |
| `src/pages/customer/BookingDetailPage.tsx` | Add DelayBanner + CriticalDelayModal + polling |
| `src/pages/vendor/VendorRequestDetailPage.tsx` | Add DelayBanner with vendor actions |
| `src/pages/admin/AdminBookingDetailPage.tsx` | Add DelayBanner with admin actions |

### Test Files

| File | Tests |
|------|-------|
| `src/utils/getDisplayStatus.test.ts` | 12 scenarios covering priority resolution |
| `src/services/delayService.test.ts` | API call shapes and error handling |
| `src/components/delay/DelayBanner.test.tsx` | Role-based rendering and actions |

---

## Task 1: Delay Types

**Files:**
- Create: `src/types/delay.ts`
- Modify: `src/types/domain.ts`

- [ ] **Step 1: Create delay types file**

```typescript
// src/types/delay.ts
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
```

- [ ] **Step 2: Update domain.ts to re-export delay types**

Add at the bottom of `src/types/domain.ts`:

```typescript
// Delay communication types
export type { DelayType, DelayReason, DelayEvent, DelayReporterRole, ClientDelayResponse, ReportDelayPayload, RespondToDelayPayload, RescheduleRequest, RescheduleStatus, RescheduleInitiator, DisplayStatus, BookingWithDelay } from './delay'
```

Also update the NotificationType:

Change:
```typescript
export type NotificationType = 'booking' | 'payment' | 'system' | 'vendor'
```
To:
```typescript
export type NotificationType = 'booking' | 'payment' | 'system' | 'vendor' | 'delay' | 'reschedule'
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — no existing code uses the new types yet

- [ ] **Step 4: Commit**

```bash
git add src/types/delay.ts src/types/domain.ts
git commit -m "feat(types): add delay event, reschedule request, and display status types"
```

---

## Task 2: Delay Reasons Utility

**Files:**
- Create: `src/utils/delayReasons.ts`

- [ ] **Step 1: Create delay reasons utility**

```typescript
// src/utils/delayReasons.ts
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
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/delayReasons.ts
git commit -m "feat(utils): add delay reason taxonomy with category-based filtering"
```

---

## Task 3: getDisplayStatus Utility (TDD)

**Files:**
- Create: `src/utils/getDisplayStatus.ts`
- Create: `src/utils/getDisplayStatus.test.ts`
- Modify: `src/data/helpers.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/utils/getDisplayStatus.test.ts
import { describe, it, expect } from 'vitest'
import { getDisplayStatus } from './getDisplayStatus'
import type { Booking } from '../types/domain'
import type { DelayEvent, RescheduleRequest } from '../types/delay'

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    booking_id: 'HC-1001',
    customer_name: 'Test',
    phone: '9876543210',
    address: '123 Test St',
    lat: 0,
    lng: 0,
    category: 'ac',
    service_id: 1,
    service_name: 'AC Cleaning',
    price: 500,
    services_list: [],
    preferred_date: '2026-04-13',
    time_slot: '9AM-12PM',
    payment_mode: 'PAY_AFTER_SERVICE',
    payment_status: 'PENDING',
    razorpay_order_id: null,
    booking_status: 'accepted',
    created_at: '2026-04-12T10:00:00Z',
    updated_at: '2026-04-12T10:00:00Z',
    ...overrides,
  } as Booking
}

function makeDelay(overrides: Partial<DelayEvent> = {}): DelayEvent {
  return {
    id: 'd1',
    booking_id: 'HC-1001',
    delay_type: 'running_late',
    reason: 'traffic',
    reason_note: null,
    revised_eta: '2026-04-13T14:30:00Z',
    original_eta: '2026-04-13T13:00:00Z',
    reported_by_user_id: 'u1',
    reported_by_role: 'technician',
    client_response: 'pending',
    client_responded_at: null,
    is_active: true,
    created_at: '2026-04-13T13:10:00Z',
    updated_at: '2026-04-13T13:10:00Z',
    ...overrides,
  }
}

function makeReschedule(
  overrides: Partial<RescheduleRequest> = {},
): RescheduleRequest {
  return {
    id: 'r1',
    booking_id: 'HC-1001',
    initiated_by_user_id: 'u1',
    initiated_by_role: 'vendor',
    reason: 'parts_unavailable',
    reason_note: null,
    original_date: '2026-04-13',
    original_time_slot: '9AM-12PM',
    proposed_date: '2026-04-15',
    proposed_time_slot: '9AM-12PM',
    status: 'proposed',
    responded_by_user_id: null,
    responded_by_role: null,
    counter_date: null,
    counter_time_slot: null,
    expires_at: '2026-04-14T13:00:00Z',
    reschedule_number: 1,
    created_at: '2026-04-13T13:00:00Z',
    updated_at: '2026-04-13T13:00:00Z',
    ...overrides,
  }
}

describe('getDisplayStatus', () => {
  it('returns base status when no delay or reschedule', () => {
    expect(getDisplayStatus(makeBooking(), null, null)).toBe('accepted')
  })

  it('returns "delayed" for active running_late', () => {
    expect(getDisplayStatus(makeBooking(), makeDelay(), null)).toBe('delayed')
  })

  it('returns "cannot_attend" for active cannot_attend', () => {
    const delay = makeDelay({ delay_type: 'cannot_attend', revised_eta: null })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('cannot_attend')
  })

  it('returns "rescheduling" for proposed reschedule', () => {
    expect(getDisplayStatus(makeBooking(), null, makeReschedule())).toBe(
      'rescheduling',
    )
  })

  it('returns "rescheduling" for counter_proposed reschedule', () => {
    const rs = makeReschedule({ status: 'counter_proposed' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('rescheduling')
  })

  it('returns "rescheduled" for accepted reschedule', () => {
    const rs = makeReschedule({ status: 'accepted' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('rescheduled')
  })

  it('prioritises reschedule over delay', () => {
    expect(
      getDisplayStatus(makeBooking(), makeDelay(), makeReschedule()),
    ).toBe('rescheduling')
  })

  it('prioritises cannot_attend over running_late', () => {
    const delay = makeDelay({ delay_type: 'cannot_attend', revised_eta: null })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('cannot_attend')
  })

  it('falls through when delay is inactive', () => {
    const delay = makeDelay({ is_active: false })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('accepted')
  })

  it('falls through when reschedule is expired', () => {
    const rs = makeReschedule({ status: 'expired' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('accepted')
  })

  it('returns base status when all null', () => {
    const b = makeBooking({ booking_status: 'pending' })
    expect(getDisplayStatus(b, null, null)).toBe('pending')
  })

  it('returns "completed" for completed booking even with active delay', () => {
    const b = makeBooking({ booking_status: 'completed' })
    expect(getDisplayStatus(b, makeDelay(), null)).toBe('completed')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/getDisplayStatus.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

```typescript
// src/utils/getDisplayStatus.ts
import type { Booking } from '../types/domain'
import type { DelayEvent, DisplayStatus, RescheduleRequest } from '../types/delay'

const TERMINAL: Set<string> = new Set(['completed', 'cancelled', 'rejected'])

export function getDisplayStatus(
  booking: Booking,
  activeDelay: DelayEvent | null,
  activeReschedule: RescheduleRequest | null,
): DisplayStatus {
  // Terminal statuses always win — the booking is done
  if (TERMINAL.has(booking.booking_status)) {
    return booking.booking_status
  }

  // Reschedule takes highest priority (active states only)
  if (activeReschedule) {
    if (
      activeReschedule.status === 'proposed' ||
      activeReschedule.status === 'counter_proposed'
    ) {
      return 'rescheduling'
    }
    if (activeReschedule.status === 'accepted' || activeReschedule.status === 'auto_confirmed') {
      return 'rescheduled'
    }
  }

  // Delay overlay (only if active)
  if (activeDelay?.is_active) {
    if (activeDelay.delay_type === 'cannot_attend') return 'cannot_attend'
    if (activeDelay.delay_type === 'running_late') return 'delayed'
  }

  return booking.booking_status
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/getDisplayStatus.test.ts`
Expected: PASS — all 12 tests green

- [ ] **Step 5: Add displayStatusLabel to helpers**

In `src/data/helpers.ts`, add after the existing `bookingStatusLabel` function:

```typescript
import type { DisplayStatus } from '../types/delay'

const DISPLAY_STATUS_LABELS: Record<string, string> = {
  delayed: 'Delayed',
  cannot_attend: 'Cannot Attend',
  rescheduling: 'Rescheduling',
  rescheduled: 'Rescheduled',
}

export function displayStatusLabel(status: DisplayStatus): string {
  return DISPLAY_STATUS_LABELS[status] ?? bookingStatusLabel(status)
}
```

- [ ] **Step 6: Run typecheck and tests**

Run: `npm run typecheck && npx vitest run src/utils/getDisplayStatus.test.ts`
Expected: Both PASS

- [ ] **Step 7: Commit**

```bash
git add src/utils/getDisplayStatus.ts src/utils/getDisplayStatus.test.ts src/data/helpers.ts
git commit -m "feat(utils): add getDisplayStatus with priority resolution and displayStatusLabel"
```

---

## Task 4: Delay Service

**Files:**
- Create: `src/services/delayService.ts`

- [ ] **Step 1: Create delay service**

```typescript
// src/services/delayService.ts
import { api } from './api'
import type { DelayEvent, ReportDelayPayload, RespondToDelayPayload } from '../types/delay'

interface Envelope<T> {
  success?: boolean
  data: T
  message?: string
}

export const delayService = {
  reportDelay: async (
    bookingId: string,
    payload: ReportDelayPayload,
  ): Promise<DelayEvent> => {
    const res = await api.post<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay`,
      payload,
    )
    return res.data
  },

  updateDelay: async (
    bookingId: string,
    delayId: string,
    payload: Partial<ReportDelayPayload>,
  ): Promise<DelayEvent> => {
    const res = await api.patch<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay/${delayId}`,
      payload,
    )
    return res.data
  },

  respondToDelay: async (
    bookingId: string,
    delayId: string,
    payload: RespondToDelayPayload,
  ): Promise<DelayEvent> => {
    const res = await api.post<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay/${delayId}/respond`,
      payload,
    )
    return res.data
  },

  getDelayEvents: async (bookingId: string): Promise<DelayEvent[]> => {
    const res = await api.get<Envelope<DelayEvent[]>>(
      `/bookings/${bookingId}/delay-events`,
    )
    return res.data ?? []
  },
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/delayService.ts
git commit -m "feat(services): add delayService with report, update, respond, and list endpoints"
```

---

## Task 5: CSS Badge Classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add 4 new badge variant classes**

In `src/index.css`, after the existing `.badge-pay-pending` line (around line 131), add:

```css
/* Delay communication badges */
.badge-delayed { background: #FEF3C7; color: #92400E; }
.badge-cannot-attend { background: #FEE2E2; color: #991B1B; }
.badge-rescheduling { background: #EDE9FE; color: #4C1D95; }
.badge-rescheduled { background: #DBEAFE; color: #1E40AF; }
```

- [ ] **Step 2: Run build to verify CSS is valid**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(css): add badge-delayed, badge-cannot-attend, badge-rescheduling, badge-rescheduled"
```

---

## Task 6: StatusBadge Enhancement

**Files:**
- Modify: `src/components/bookings/StatusBadge.tsx`

- [ ] **Step 1: Update StatusBadge to accept DisplayStatus**

Replace the full contents of `src/components/bookings/StatusBadge.tsx`:

```typescript
import { memo } from 'react'
import type { DisplayStatus } from '../../types/delay'
import { displayStatusLabel } from '../../data/helpers'

interface StatusBadgeProps {
  status: DisplayStatus
  className?: string
}

const VARIANT: Record<DisplayStatus, string> = {
  pending: 'badge-warning',
  assigned: 'badge-info',
  accepted: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
  rejected: 'badge-error',
  delayed: 'badge-delayed',
  cannot_attend: 'badge-cannot-attend',
  rescheduling: 'badge-rescheduling',
  rescheduled: 'badge-rescheduled',
}

export const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  return (
    <span className={`badge ${VARIANT[status]} ${className ?? ''}`.trim()}>
      {displayStatusLabel(status)}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — DisplayStatus is a superset of BookingStatus, so all existing call sites still work

- [ ] **Step 3: Commit**

```bash
git add src/components/bookings/StatusBadge.tsx
git commit -m "feat(StatusBadge): support 4 new delay display status variants"
```

---

## Task 7: StatusTimeline Enhancement

**Files:**
- Modify: `src/components/bookings/StatusTimeline.tsx`

- [ ] **Step 1: Update StatusTimeline with delay event rendering**

Replace the full contents of `src/components/bookings/StatusTimeline.tsx`:

```typescript
import { memo } from 'react'
import type { BookingStatusEvent } from '../../types/domain'
import { formatDateTime } from '../../data/helpers'
import { StatusBadge } from './StatusBadge'

interface StatusTimelineProps {
  events: BookingStatusEvent[]
}

const EVENT_LABEL: Record<string, string> = {
  create: 'Booking created',
  assign: 'Vendor assigned',
  accept: 'Accepted by vendor',
  reject: 'Rejected by vendor',
  start: 'Service started',
  complete: 'Service completed',
  cancel: 'Booking cancelled',
  delay_reported: 'Delay reported',
  delay_updated: 'Delay updated',
  delay_accepted: 'Client accepted revised ETA',
  delay_cancelled: 'Client cancelled due to delay',
  cannot_attend: 'Technician cannot attend',
  reschedule_proposed: 'Reschedule proposed',
  reschedule_accepted: 'Reschedule accepted',
  reschedule_rejected: 'Reschedule rejected',
  reschedule_counter: 'Counter-proposal submitted',
  technician_reassigned: 'Technician reassigned',
}

const DELAY_EVENTS = new Set([
  'delay_reported',
  'delay_updated',
  'cannot_attend',
])
const RESOLVE_EVENTS = new Set([
  'delay_accepted',
  'reschedule_accepted',
  'technician_reassigned',
])
const ERROR_EVENTS = new Set(['delay_cancelled', 'reschedule_rejected'])

function getDotClass(event: string): string {
  if (DELAY_EVENTS.has(event)) return 'bg-accent-soft border-warning'
  if (ERROR_EVENTS.has(event)) return 'bg-error-soft border-error'
  if (RESOLVE_EVENTS.has(event)) return 'border-success bg-[#DCFCE7]'
  return 'bg-brand-soft border-brand'
}

export const StatusTimeline = memo(({ events }: StatusTimelineProps) => {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted">No activity recorded yet.</p>
    )
  }

  return (
    <ol className="relative border-l border-default pl-6 space-y-5">
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span
            className={`absolute -left-[27.5px] top-1 w-[11px] h-[11px] rounded-full border-2 ring-4 ring-surface ${getDotClass(ev.event)}`}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ev.to_status} />
            <span className="text-sm font-semibold text-primary">
              {EVENT_LABEL[ev.event] ?? ev.event}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {formatDateTime(ev.created_at)} · by {ev.actor_role}
          </p>
          {ev.note && (
            <p className="text-sm text-secondary mt-1 italic">"{ev.note}"</p>
          )}
        </li>
      ))}
    </ol>
  )
})

StatusTimeline.displayName = 'StatusTimeline'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/bookings/StatusTimeline.tsx
git commit -m "feat(StatusTimeline): add delay and reschedule event types with color-coded dots"
```

---

## Task 8: DelayReasonPicker Component

**Files:**
- Create: `src/components/delay/DelayReasonPicker.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/delay/DelayReasonPicker.tsx
import { memo } from 'react'
import type { DelayReason, DelayType } from '../../types/delay'
import { getReasonsForType } from '../../utils/delayReasons'

interface DelayReasonPickerProps {
  delayType: DelayType | 'reschedule'
  selected: DelayReason | null
  onSelect: (reason: DelayReason) => void
}

export const DelayReasonPicker = memo(
  ({ delayType, selected, onSelect }: DelayReasonPickerProps) => {
    const reasons = getReasonsForType(delayType)

    return (
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select reason">
        {reasons.map((r) => {
          const isSelected = selected === r.value
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(r.value)}
              className={`px-3.5 py-2 rounded-[10px] text-[0.78rem] font-semibold border-[1.5px] transition-all min-h-[40px] ${
                isSelected
                  ? 'border-warning bg-accent-soft text-accent-strong'
                  : 'border-border bg-card text-text-secondary hover:border-text-muted hover:bg-surface'
              }`}
            >
              {r.label}
            </button>
          )
        })}
      </div>
    )
  },
)

DelayReasonPicker.displayName = 'DelayReasonPicker'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/delay/DelayReasonPicker.tsx
git commit -m "feat(components): add DelayReasonPicker chip-based reason selector"
```

---

## Task 9: RevisedEtaPicker Component

**Files:**
- Create: `src/components/delay/RevisedEtaPicker.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/delay/RevisedEtaPicker.tsx
import { memo, useMemo } from 'react'

interface RevisedEtaPickerProps {
  value: string
  onChange: (isoTime: string) => void
}

function formatTimeDisplay(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime)
    if (isNaN(d.getTime())) return isoOrTime
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return isoOrTime
  }
}

function minutesFromNow(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime)
    if (isNaN(d.getTime())) return ''
    const diff = Math.round((d.getTime() - Date.now()) / 60000)
    if (diff <= 0) return 'now'
    if (diff < 60) return `~${diff} min from now`
    const hrs = Math.floor(diff / 60)
    const mins = diff % 60
    return mins > 0 ? `~${hrs}h ${mins}m from now` : `~${hrs}h from now`
  } catch {
    return ''
  }
}

export const RevisedEtaPicker = memo(({ value, onChange }: RevisedEtaPickerProps) => {
  const display = useMemo(() => formatTimeDisplay(value), [value])
  const helper = useMemo(() => minutesFromNow(value), [value])

  return (
    <div className="flex items-center gap-3">
      <input
        type="time"
        value={value.includes('T') ? value.slice(11, 16) : value}
        onChange={(e) => {
          const today = new Date().toISOString().slice(0, 10)
          onChange(`${today}T${e.target.value}:00`)
        }}
        className="input-base px-4 py-2.5 font-brand text-lg font-bold text-warning tabular-nums min-h-[44px]"
        aria-label="Revised arrival time"
      />
      <div className="text-xs text-muted">
        {display}
        {helper && <span className="block mt-0.5">{helper}</span>}
      </div>
    </div>
  )
})

RevisedEtaPicker.displayName = 'RevisedEtaPicker'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/delay/RevisedEtaPicker.tsx
git commit -m "feat(components): add RevisedEtaPicker time input with relative display"
```

---

## Task 10: ReportDelaySheet and CannotAttendSheet

**Files:**
- Create: `src/components/delay/ReportDelaySheet.tsx`
- Create: `src/components/delay/CannotAttendSheet.tsx`

- [ ] **Step 1: Create ReportDelaySheet**

```typescript
// src/components/delay/ReportDelaySheet.tsx
import { useState } from 'react'
import Modal from '../common/Modal'
import { DelayReasonPicker } from './DelayReasonPicker'
import { RevisedEtaPicker } from './RevisedEtaPicker'
import { delayService } from '../../services/delayService'
import useStore from '../../store/useStore'
import type { DelayReason } from '../../types/delay'

interface ReportDelaySheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  onSuccess: () => void
}

export function ReportDelaySheet({ isOpen, onClose, bookingId, onSuccess }: ReportDelaySheetProps) {
  const showToast = useStore((s) => s.showToast)

  const [reason, setReason] = useState<DelayReason | null>(null)
  const [eta, setEta] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = reason !== null && eta !== '' && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await delayService.reportDelay(bookingId, {
        delay_type: 'running_late',
        reason,
        revised_eta: eta,
        reason_note: note.trim() || undefined,
      })
      showToast('Delay reported — client will be notified', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to report delay', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5">
        <h2 className="font-brand text-lg font-bold text-primary">Report Delay</h2>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Reason <span className="text-error">*</span>
          </p>
          <DelayReasonPicker delayType="running_late" selected={reason} onSelect={setReason} />
        </div>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Revised ETA <span className="text-error">*</span>
          </p>
          <RevisedEtaPicker value={eta} onChange={setEta} />
        </div>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Note <span className="text-xs font-normal normal-case tracking-normal text-muted">(optional)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="Additional context for the client..."
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-base w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60 bg-warning text-white hover:bg-accent-strong"
        >
          {submitting ? 'Submitting...' : 'Submit Delay Report'}
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Create CannotAttendSheet**

```typescript
// src/components/delay/CannotAttendSheet.tsx
import { useState } from 'react'
import Modal from '../common/Modal'
import { DelayReasonPicker } from './DelayReasonPicker'
import { delayService } from '../../services/delayService'
import useStore from '../../store/useStore'
import type { DelayReason } from '../../types/delay'

interface CannotAttendSheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  onSuccess: () => void
}

export function CannotAttendSheet({ isOpen, onClose, bookingId, onSuccess }: CannotAttendSheetProps) {
  const showToast = useStore((s) => s.showToast)

  const [reason, setReason] = useState<DelayReason | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = reason !== null && note.trim().length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await delayService.reportDelay(bookingId, {
        delay_type: 'cannot_attend',
        reason,
        reason_note: note.trim(),
      })
      showToast('Reported — client and vendor will be notified', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to report', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5">
        <h2 className="font-brand text-lg font-bold text-primary">Cannot Attend</h2>
        <p className="text-sm text-muted -mt-3">
          The client will be notified and offered reschedule options.
        </p>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Reason <span className="text-error">*</span>
          </p>
          <DelayReasonPicker delayType="cannot_attend" selected={reason} onSelect={setReason} />
        </div>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Note <span className="text-error">*</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="Explain the situation..."
            aria-required="true"
          />
          {note.length === 0 && (
            <p className="text-xs text-muted mt-1">A note is required when reporting cannot attend</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-base btn-danger w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Report Cannot Attend'}
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/delay/ReportDelaySheet.tsx src/components/delay/CannotAttendSheet.tsx
git commit -m "feat(components): add ReportDelaySheet and CannotAttendSheet for technician delay reporting"
```

---

## Task 11: DelayBanner Component

**Files:**
- Create: `src/components/delay/DelayBanner.tsx`

- [ ] **Step 1: Create DelayBanner**

```typescript
// src/components/delay/DelayBanner.tsx
import { memo, useMemo } from 'react'
import type { DelayEvent } from '../../types/delay'
import { getReasonLabel } from '../../utils/delayReasons'

interface DelayBannerProps {
  delay: DelayEvent
  role: 'customer' | 'vendor' | 'technician' | 'admin'
  onAcceptEta?: () => void
  onReschedule?: () => void
  onCancel?: () => void
  onReassign?: () => void
}

function formatTime(iso: string | null): string {
  if (!iso) return '--'
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}

function timeAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff} min ago`
  const hrs = Math.floor(diff / 60)
  return `${hrs}h ${diff % 60}m ago`
}

export const DelayBanner = memo(
  ({ delay, role, onAcceptEta, onReschedule, onCancel, onReassign }: DelayBannerProps) => {
    const isCannotAttend = delay.delay_type === 'cannot_attend'
    const variant = isCannotAttend ? 'error' : 'warning'

    const gradientClass = isCannotAttend
      ? 'from-error to-error/50'
      : 'from-warning to-accent-strong/50'

    const iconColor = isCannotAttend ? 'text-error' : 'text-warning'
    const titleColor = isCannotAttend ? 'text-[#991B1B]' : 'text-[#92400E]'
    const iconBg = isCannotAttend ? 'bg-error-soft' : 'bg-accent-soft'

    const ago = useMemo(() => timeAgo(delay.created_at), [delay.created_at])

    return (
      <div
        className="relative glass-card no-hover overflow-hidden"
        role="alert"
      >
        {/* Accent top edge */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradientClass}`}
          style={{ maskImage: 'linear-gradient(to right, black 80%, transparent)' }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}
            >
              {isCannotAttend ? (
                <svg className={`w-[18px] h-[18px] ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg className={`w-[18px] h-[18px] ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-brand text-sm font-bold ${titleColor}`}>
                {isCannotAttend ? 'Technician Cannot Attend' : 'Technician Running Late'}
              </p>
              <p className="text-[0.8rem] text-secondary mt-0.5">
                {getReasonLabel(delay.reason)}
                {delay.reason_note ? ` — ${delay.reason_note}` : ''}
              </p>

              {/* ETA comparison for running_late */}
              {!isCannotAttend && delay.revised_eta && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-surface border border-border rounded-[10px] text-xs">
                  <span className="line-through text-muted tabular-nums">
                    {formatTime(delay.original_eta)}
                  </span>
                  <span className="text-border">→</span>
                  <span className="font-extrabold text-warning tabular-nums text-sm">
                    {formatTime(delay.revised_eta)}
                  </span>
                </div>
              )}

              <p className="text-[0.65rem] text-muted mt-2 tracking-wide">
                Reported {ago} by {delay.reported_by_role}
              </p>

              {/* Vendor/admin: show client response status */}
              {(role === 'vendor' || role === 'admin') && delay.client_response && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[0.7rem] text-muted">Client:</span>
                  <span className={`badge text-[0.65rem] ${
                    delay.client_response === 'accepted'
                      ? 'badge-success'
                      : delay.client_response === 'cancelled'
                        ? 'badge-cancelled'
                        : 'badge-warning'
                  }`}>
                    {delay.client_response === 'pending' ? 'Awaiting' : delay.client_response}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-border">
            {role === 'customer' && !isCannotAttend && onAcceptEta && (
              <button
                type="button"
                onClick={onAcceptEta}
                className="btn-base flex-1 py-2.5 text-[0.8rem] font-bold bg-warning text-white hover:bg-accent-strong min-h-[44px]"
              >
                Accept ETA
              </button>
            )}
            {role === 'customer' && onReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className="btn-base btn-secondary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reschedule
              </button>
            )}
            {role === 'customer' && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-base py-2.5 text-[0.8rem] font-semibold text-error hover:bg-error-soft min-h-[44px] px-4"
              >
                Cancel
              </button>
            )}

            {(role === 'vendor' || role === 'admin') && onReassign && (
              <button
                type="button"
                onClick={onReassign}
                className="btn-base btn-primary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reassign Technician
              </button>
            )}
            {(role === 'vendor' || role === 'admin') && onReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className="btn-base btn-secondary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>
    )
  },
)

DelayBanner.displayName = 'DelayBanner'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/delay/DelayBanner.tsx
git commit -m "feat(components): add DelayBanner with role-aware actions and premium styling"
```

---

## Task 12: CriticalDelayModal Component

**Files:**
- Create: `src/components/delay/CriticalDelayModal.tsx`

- [ ] **Step 1: Create CriticalDelayModal**

```typescript
// src/components/delay/CriticalDelayModal.tsx
import Modal from '../common/Modal'
import type { DelayEvent } from '../../types/delay'
import { getReasonLabel } from '../../utils/delayReasons'

interface CriticalDelayModalProps {
  isOpen: boolean
  onClose: () => void
  delay: DelayEvent
  bookingName: string
  bookingId: string
  onReschedule: () => void
  onRequestDifferentTech: () => void
  onCancel: () => void
}

export function CriticalDelayModal({
  isOpen,
  onClose,
  delay,
  bookingName,
  bookingId,
  onReschedule,
  onRequestDifferentTech,
  onCancel,
}: CriticalDelayModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        {/* Icon */}
        <div className="w-[52px] h-[52px] rounded-[14px] bg-error-soft flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg
            className="w-6 h-6 text-error"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h2 className="font-brand text-lg font-bold text-primary">
          Technician Cannot Attend
        </h2>
        <p className="text-sm text-muted mt-1">
          {bookingName} — #{bookingId}
        </p>
      </div>

      {/* Detail card */}
      <div className="mx-5 mb-5 bg-surface border border-border rounded-[14px] p-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">
          Reason
        </p>
        <p className="text-sm text-primary font-medium">
          {getReasonLabel(delay.reason)}
        </p>

        {delay.reason_note && (
          <>
            <div className="h-px bg-border my-3" />
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">
              Note from technician
            </p>
            <p className="text-sm text-secondary italic leading-relaxed">
              "{delay.reason_note}"
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-6 space-y-2">
        <button
          type="button"
          onClick={onReschedule}
          className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px]"
        >
          Reschedule Booking
        </button>
        <button
          type="button"
          onClick={onRequestDifferentTech}
          className="btn-base btn-secondary w-full py-3.5 text-sm font-bold min-h-[48px]"
        >
          Request Different Technician
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-base w-full py-3 text-[0.82rem] font-semibold text-error hover:bg-error-soft min-h-[44px]"
        >
          Cancel Booking
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/delay/CriticalDelayModal.tsx
git commit -m "feat(components): add CriticalDelayModal bottom sheet for cannot-attend events"
```

---

## Task 13: Barrel Export

**Files:**
- Create: `src/components/delay/index.ts`

- [ ] **Step 1: Create barrel export**

```typescript
// src/components/delay/index.ts
export { DelayReasonPicker } from './DelayReasonPicker'
export { RevisedEtaPicker } from './RevisedEtaPicker'
export { DelayBanner } from './DelayBanner'
export { ReportDelaySheet } from './ReportDelaySheet'
export { CannotAttendSheet } from './CannotAttendSheet'
export { CriticalDelayModal } from './CriticalDelayModal'
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/delay/index.ts
git commit -m "feat(components): add delay component barrel export"
```

---

## Task 14: useBookingPolling Hook

**Files:**
- Create: `src/hooks/useBookingPolling.ts`

- [ ] **Step 1: Create the polling hook**

```typescript
// src/hooks/useBookingPolling.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../types/domain'

const POLL_INTERVAL_MS = 10_000

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr === today
}

export function useBookingPolling(
  bookingId: string | undefined,
  preferredDate: string | undefined,
): { booking: Booking | null; isPolling: boolean } {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const shouldPoll = !!(bookingId && preferredDate && isToday(preferredDate))

  const poll = useCallback(async () => {
    if (!bookingId) return
    try {
      const b = await bookingService.getById(bookingId)
      setBooking(b)
    } catch {
      // Silently fail on poll — next tick will retry
    }
  }, [bookingId])

  useEffect(() => {
    if (!shouldPoll) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        poll()
        if (!intervalRef.current) {
          intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    // Start immediately
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibility)
      setIsPolling(false)
    }
  }, [shouldPoll, poll])

  return { booking, isPolling }
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBookingPolling.ts
git commit -m "feat(hooks): add useBookingPolling with 10s interval and visibility awareness"
```

---

## Task 15: Integrate into TechnicianJobDetailPage

**Files:**
- Modify: `src/pages/technician/TechnicianJobDetailPage.tsx`

- [ ] **Step 1: Add delay imports and state**

At the top of the file, add to the existing imports:

```typescript
import { ReportDelaySheet, CannotAttendSheet } from '../../components/delay'
```

Inside the component, after the existing `busy` state (line 21), add:

```typescript
const [showDelaySheet, setShowDelaySheet] = useState(false)
const [showCannotAttend, setShowCannotAttend] = useState(false)
```

- [ ] **Step 2: Add delay buttons between the Start Job button and OTP section**

After the `canStart` button block (after line 182) and before the `canComplete` block (line 184), add:

```tsx
{/* Delay reporting — visible when accepted or in_progress */}
{(canStart || canComplete) && (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setShowDelaySheet(true)}
      disabled={busy !== null}
      className="btn-base flex-1 py-3 text-sm font-bold min-h-[48px] bg-warning text-white hover:bg-accent-strong disabled:opacity-60"
    >
      Report Delay
    </button>
    <button
      type="button"
      onClick={() => setShowCannotAttend(true)}
      disabled={busy !== null}
      className="btn-base py-3 text-sm font-bold min-h-[48px] border-[1.5px] border-error text-error hover:bg-error-soft disabled:opacity-60 px-4"
    >
      Cannot Attend
    </button>
  </div>
)}

<ReportDelaySheet
  isOpen={showDelaySheet}
  onClose={() => setShowDelaySheet(false)}
  bookingId={booking.booking_id}
  onSuccess={load}
/>
<CannotAttendSheet
  isOpen={showCannotAttend}
  onClose={() => setShowCannotAttend(false)}
  bookingId={booking.booking_id}
  onSuccess={load}
/>
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/technician/TechnicianJobDetailPage.tsx
git commit -m "feat(technician): add delay reporting and cannot-attend buttons to job detail page"
```

---

## Task 16: Integrate into Customer BookingDetailPage

**Files:**
- Modify: `src/pages/customer/BookingDetailPage.tsx`

- [ ] **Step 1: Add delay imports and state**

Add to imports:

```typescript
import { DelayBanner, CriticalDelayModal } from '../../components/delay'
import { delayService } from '../../services/delayService'
import type { DelayEvent } from '../../types/delay'
```

Inside the component, after existing state declarations (after line 29), add:

```typescript
const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
```

- [ ] **Step 2: Fetch delay events in the load function**

Update the `load` callback. Replace the existing `Promise.all` call (lines 36-40) with:

```typescript
const [b, ev, rv, delays] = await Promise.all([
  bookingService.getById(id),
  bookingService.getEvents(id),
  bookingService.getReview(id),
  delayService.getDelayEvents(id).catch(() => []),
])
setBooking(b)
setEvents(ev)
setReview(rv)
setActiveDelay(delays.find((d) => d.is_active) ?? null)
```

- [ ] **Step 3: Add delay response handlers**

After the `handleCancel` function (after line 70), add:

```typescript
const handleAcceptEta = async () => {
  if (!id || !activeDelay) return
  try {
    await delayService.respondToDelay(id, activeDelay.id, { response: 'accepted' })
    showToast('Revised ETA accepted', 'success')
    await load()
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Failed to respond', 'danger')
  }
}

const handleRequestDifferentTech = async () => {
  if (!id || !activeDelay) return
  try {
    await delayService.respondToDelay(id, activeDelay.id, { response: 'reschedule_requested' })
    showToast('Request sent to vendor', 'success')
    await load()
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Failed to request', 'danger')
  }
}
```

- [ ] **Step 4: Add DelayBanner and CriticalDelayModal to the JSX**

After the booking detail card's closing `</div>` (after line 179) and before the OTP section (line 181), add:

```tsx
{/* Delay communication */}
{activeDelay && activeDelay.delay_type === 'running_late' && (
  <DelayBanner
    delay={activeDelay}
    role="customer"
    onAcceptEta={handleAcceptEta}
    onCancel={handleCancel}
  />
)}

{activeDelay && activeDelay.delay_type === 'cannot_attend' && (
  <CriticalDelayModal
    isOpen={true}
    onClose={() => setActiveDelay(null)}
    delay={activeDelay}
    bookingName={booking.service_name}
    bookingId={booking.booking_id}
    onReschedule={() => showToast('Reschedule flow coming in Phase 2', 'info')}
    onRequestDifferentTech={handleRequestDifferentTech}
    onCancel={handleCancel}
  />
)}
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/customer/BookingDetailPage.tsx
git commit -m "feat(customer): integrate DelayBanner and CriticalDelayModal into booking detail"
```

---

## Task 17: Integrate into VendorRequestDetailPage

**Files:**
- Modify: `src/pages/vendor/VendorRequestDetailPage.tsx`

- [ ] **Step 1: Add delay imports and state**

Add to imports:

```typescript
import { DelayBanner } from '../../components/delay'
import { delayService } from '../../services/delayService'
import type { DelayEvent } from '../../types/delay'
```

Inside the component, after existing state declarations, add:

```typescript
const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
```

- [ ] **Step 2: Fetch delay events in the load function**

Add to the existing `Promise.all` in `load`:

```typescript
delayService.getDelayEvents(id).catch(() => []),
```

And after the destructured result, add:

```typescript
setActiveDelay(delays.find((d) => d.is_active) ?? null)
```

Update the destructuring to include `delays`:
```typescript
const [b, ev, techs, delays] = await Promise.all([
  bookingService.getById(id),
  bookingService.getEvents(id),
  technicianService.listMine().catch(() => []),
  delayService.getDelayEvents(id).catch(() => []),
])
```

- [ ] **Step 3: Add DelayBanner to JSX**

In the JSX, after the booking detail card and before the action buttons section, add:

```tsx
{activeDelay && (
  <DelayBanner
    delay={activeDelay}
    role="vendor"
    onReschedule={() => showToast('Reschedule flow coming in Phase 2', 'info')}
  />
)}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/vendor/VendorRequestDetailPage.tsx
git commit -m "feat(vendor): integrate DelayBanner into request detail page"
```

---

## Task 18: Integrate into AdminBookingDetailPage

**Files:**
- Modify: `src/pages/admin/AdminBookingDetailPage.tsx`

- [ ] **Step 1: Add delay imports and state**

Same pattern as vendor. Add to imports:

```typescript
import { DelayBanner } from '../../components/delay'
import { delayService } from '../../services/delayService'
import type { DelayEvent } from '../../types/delay'
```

Add state:

```typescript
const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
```

- [ ] **Step 2: Fetch delay events in the load function**

Add `delayService.getDelayEvents(id).catch(() => [])` to the existing `Promise.all` and destructure `delays`, then:

```typescript
setActiveDelay(delays.find((d) => d.is_active) ?? null)
```

- [ ] **Step 3: Add DelayBanner to JSX**

Before the "Admin override" section (before line 331), add:

```tsx
{activeDelay && (
  <DelayBanner
    delay={activeDelay}
    role="admin"
    onReschedule={() => showToast('Reschedule flow coming in Phase 2', 'info')}
  />
)}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminBookingDetailPage.tsx
git commit -m "feat(admin): integrate DelayBanner into booking detail page"
```

---

## Task 19: Final Verification

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: PASS with zero errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: PASS (or only pre-existing warnings)

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: PASS — production build succeeds

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All existing tests pass. getDisplayStatus tests pass.

- [ ] **Step 5: Start dev server and verify**

Run: `npm run dev`

Manual checks:
- Open technician job detail for an accepted booking → "Report Delay" and "Cannot Attend" buttons visible
- Click "Report Delay" → modal opens with reason chips and ETA picker
- Click "Cannot Attend" → modal opens with reason chips and required note
- StatusBadge renders all 11 statuses without errors
- Existing booking pages render normally without delay data (null active_delay gracefully handled)
- No console errors

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address integration issues from delay communication MVP"
```
