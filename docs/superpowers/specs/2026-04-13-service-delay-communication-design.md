# Service Delay Communication — Design Spec

> **Date**: 2026-04-13
> **Status**: Approved
> **Author**: Staff Engineer + Product Design (Claude)

---

## 1. Executive Summary

When a booking is scheduled for today and the technician cannot arrive on time (or at all), the system currently offers zero communication. The only option is cancellation — destroying trust and losing revenue.

This feature introduces a graduated delay communication system that lets any role (technician, vendor, admin) report delays, propose reschedules, and keep the client informed with clear reasons, revised ETAs, and actionable response options. The design preserves the existing 7-state booking machine by overlaying delay events as metadata, with a computed display status for the UI.

**Core principle**: Match urgency to UI weight. A 20-minute traffic delay gets an inline banner. A technician who cannot attend triggers a modal that demands attention.

---

## 2. Domain Model

### 2.1 DelayEvent

```typescript
type DelayType = 'running_late' | 'cannot_attend'

type DelayReason =
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

interface DelayEvent {
  id: string
  booking_id: string
  delay_type: DelayType
  reason: DelayReason
  reason_note: string | null
  revised_eta: string | null         // ISO time, null for cannot_attend
  original_eta: string
  reported_by_user_id: string
  reported_by_role: 'technician' | 'vendor' | 'admin'
  client_response: 'pending' | 'accepted' | 'reschedule_requested' | 'cancelled' | null
  client_responded_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### 2.2 RescheduleRequest

```typescript
type RescheduleStatus =
  | 'proposed'
  | 'accepted'
  | 'rejected'
  | 'counter_proposed'
  | 'expired'
  | 'auto_confirmed'

type RescheduleInitiator = 'client' | 'vendor' | 'technician' | 'admin'

interface RescheduleRequest {
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
  reschedule_number: number           // 1, 2, or 3
  created_at: string
  updated_at: string
}
```

### 2.3 DisplayStatus (Computed)

```typescript
type DisplayStatus =
  | BookingStatus                     // existing 7
  | 'delayed'
  | 'cannot_attend'
  | 'rescheduling'
  | 'rescheduled'

interface BookingWithDelay extends Booking {
  active_delay: DelayEvent | null
  active_reschedule: RescheduleRequest | null
  delay_events: DelayEvent[]
  reschedule_requests: RescheduleRequest[]
  reschedule_count: number
}
```

### 2.4 Display Status Resolution

Priority: reschedule > cannot_attend > running_late > base status.

```
getDisplayStatus(booking, activeDelay, activeReschedule):
  if activeReschedule?.status in ['proposed', 'counter_proposed'] -> 'rescheduling'
  if activeReschedule?.status === 'accepted' (recently) -> 'rescheduled'
  if activeDelay?.delay_type === 'cannot_attend' AND is_active -> 'cannot_attend'
  if activeDelay?.delay_type === 'running_late' AND is_active -> 'delayed'
  else -> booking.booking_status
```

---

## 3. UX Flows

### 3.1 Technician Running Late

1. Time slot starts, technician hasn't tapped "Start Service"
2. App shows SmartDelayPrompt: "Scheduled for 1:00 PM -- are you running late?"
3. Technician taps "Yes, Report Delay"
4. Bottom sheet opens: reason chips + ETA picker + optional note
5. Submit creates DelayEvent (is_active: true)
6. Notifications sent to: client, vendor, admin (in-app + WhatsApp)
7. Client sees warning banner with revised ETA + Accept / Reschedule / Cancel
8. Client taps "Accept" -> technician/vendor notified
9. Technician arrives, taps "Start Service" -> normal flow resumes

### 3.2 Technician Cannot Attend

1. Technician taps "Cannot Attend" on job detail
2. Bottom sheet: reason chips + required note
3. Submit creates DelayEvent (delay_type: 'cannot_attend')
4. Client sees CriticalDelayModal: Reschedule / Request Different Technician / Cancel
5. Vendor/admin sees dashboard alert with reassign/reschedule actions
6. Resolution: vendor assigns new tech, client reschedules, or client cancels

### 3.3 Vendor/Admin Proactive Reschedule

1. Vendor/admin opens booking detail, taps "Reschedule Booking"
2. RescheduleSheet: new date + time slot + reason + note
3. Vendor/tech-initiated: client must accept. No response 2h -> reminder. 12h -> admin flagged
4. Admin-initiated: client has 24h to reject/counter. No response -> auto_confirmed

### 3.4 Client-Initiated Reschedule

1. Client taps "Reschedule" on booking detail
2. Date + time slot picker
3. Vendor notified, has 1h to respond
4. Accept -> booking updated. Reject -> client offered cancel. No response 1h -> admin flagged

---

## 4. Functional Rules

### 4.1 Delay Event Rules

| Rule | Condition | Behavior |
|------|-----------|----------|
| Who can report | technician, vendor, admin | All roles for both delay types |
| When reportable | status is assigned, accepted, or in_progress | Button visible only in these states |
| Running late requires ETA | Always | revised_eta required |
| Cannot attend -- no ETA | Always | revised_eta null, reason_note required |
| Duplicate prevention | Active delay exists | Show "Update Delay" instead of "Report Delay" |
| Superseding | New delay created | Previous active delay marked is_active: false |
| Smart prompt trigger | preferred_date === today AND time > slot start AND status === accepted AND no started_at | Auto-show on technician portal |
| Notification recipients | Always | Client + vendor + admin |

### 4.2 Client Response Rules

| Action | Precondition | Effect |
|--------|-------------|--------|
| Accept revised ETA | delay_type: running_late | client_response: accepted, notify tech + vendor |
| Request reschedule | Active delay exists | Opens RescheduleSheet |
| Request different technician | delay_type: cannot_attend | Notify vendor + admin to reassign |
| Cancel booking | status is not in_progress, technician not arrived | Booking cancelled, refund triggered |

### 4.3 Reschedule Rules

| Rule | Value |
|------|-------|
| Max reschedules per booking | 3 (across all initiators) |
| Client-initiated response window | Vendor has 1 hour |
| Vendor/tech-initiated response window | Client reminder at 2h, admin flagged at 12h |
| Admin-initiated auto-confirm | 24h without client rejection |
| Counter-propose | Counts toward max 3 |
| Blocked states | in_progress, completed, cancelled |

### 4.4 Permission Matrix

| Action | Customer | Technician | Vendor | Admin |
|--------|----------|------------|--------|-------|
| Report running late | -- | Yes | Yes | Yes |
| Report cannot attend | -- | Yes | Yes | Yes |
| Accept revised ETA | Yes | -- | -- | -- |
| Request different tech | Yes | -- | -- | -- |
| Propose reschedule | Yes | Yes | Yes | Yes |
| Accept reschedule | Yes | Yes (client-initiated) | Yes (client-initiated) | Override |
| Counter-propose | Yes | -- | Yes | Yes |
| Force reschedule | -- | -- | -- | Yes |
| Cancel on delay | Yes | -- | -- | Yes |
| Reassign technician | -- | -- | Yes | Yes |

### 4.5 Refund Policy

- Refund only on cancellation (before technician arrives at location) or rejection
- No automatic percentage-based refunds for delays
- No refund once booking_status is in_progress

---

## 5. UI Components

### 5.1 Component Inventory

**New shared components:**
- `DelayBanner` -- inline alert (warning for running_late, error for cannot_attend), role-aware actions
- `CriticalDelayModal` -- bottom sheet for cannot_attend and reschedule proposals
- `RescheduleSheet` -- date/time picker with reschedule counter
- `DelayReasonPicker` -- chip-based single-select reason selector
- `RevisedEtaPicker` -- time selector for running_late
- `RescheduleCounter` -- "1 of 3" dot indicator

**New technician components:**
- `SmartDelayPrompt` -- auto-shown banner when time > slot start
- `ReportDelaySheet` -- bottom sheet with reason + ETA + note
- `CannotAttendSheet` -- bottom sheet with reason + required note

**Modified components:**
- `StatusBadge` -- 4 new display variants (delayed, cannot_attend, rescheduling, rescheduled)
- `StatusTimeline` -- delay/reschedule events with color-coded dots (warning amber, error red, brand purple, success green)
- All 4 portal booking detail pages -- integrate DelayBanner + CriticalDelayModal

### 5.2 Design System Alignment

All components use existing design tokens:
- Lexend headings, Manrope body
- glass-card shadows, 16px card border-radius, 12px button border-radius
- Gradient accent top-edge on banners (matching Toast pattern)
- Badge anatomy: pill shape, 9999px radius, 0.72rem font, 700 weight
- Chip selectors follow nav-chip vocabulary
- Bottom sheets follow existing Modal backdrop-blur pattern
- Color tokens from index.css (--color-warning, --color-error, --color-primary-soft, etc.)
- No emojis anywhere

### 5.3 New Badge CSS Classes

```css
.badge-delayed { background: #FEF3C7; color: #92400E; }
.badge-cannot-attend { background: #FEE2E2; color: #991B1B; }
.badge-rescheduling { background: #EDE9FE; color: #4C1D95; }
.badge-rescheduled { background: #DBEAFE; color: #1E40AF; }
```

### 5.4 UI Behavior Matrix

| Scenario | Client UI | Technician UI | Vendor/Admin UI |
|----------|-----------|---------------|-----------------|
| Running late (minor) | Warning banner + Accept/Reschedule/Cancel | Confirmation "Delay reported" | Warning banner + Reassign/Reschedule |
| Cannot attend (critical) | Error modal + Reschedule/Different Tech/Cancel | -- (they triggered it) | Error banner + Reassign/Reschedule |
| Reschedule proposed to client | Modal + Accept/Suggest Different/Cancel | Status update in timeline | Status update + client response indicator |
| Reschedule proposed by client | -- (they proposed it) | Notification | Accept/Reject/Counter actions |
| Max reschedules reached | Reschedule button disabled | Reschedule button disabled | Reschedule button disabled (admin can still cancel) |

---

## 6. Engineering Architecture

### 6.1 New Files

| File | Purpose |
|------|---------|
| `src/types/delay.ts` | DelayEvent, RescheduleRequest, DisplayStatus types |
| `src/services/delayService.ts` | reportDelay, updateDelay, respondToDelay, getDelayEvents |
| `src/services/rescheduleService.ts` | proposeReschedule, respondToReschedule, counterPropose |
| `src/services/notificationChannel.ts` | Channel-agnostic NotificationChannel interface + adapters |
| `src/utils/getDisplayStatus.ts` | Pure function for computed display status |
| `src/utils/delayReasons.ts` | Reason taxonomy constants + labels |
| `src/components/delay/DelayBanner.tsx` | Inline alert banner |
| `src/components/delay/CriticalDelayModal.tsx` | Bottom sheet modal |
| `src/components/delay/RescheduleSheet.tsx` | Date/time picker |
| `src/components/delay/DelayReasonPicker.tsx` | Chip selector |
| `src/components/delay/RevisedEtaPicker.tsx` | Time picker |
| `src/components/delay/RescheduleCounter.tsx` | Dot indicator |
| `src/components/delay/SmartDelayPrompt.tsx` | Technician auto-prompt |
| `src/components/delay/ReportDelaySheet.tsx` | Technician delay form |
| `src/components/delay/CannotAttendSheet.tsx` | Technician cannot-attend form |
| `src/components/delay/index.ts` | Barrel export |

### 6.2 Modified Files

| File | Change |
|------|--------|
| `src/types/domain.ts` | Import/re-export delay types, extend NotificationType, add BookingWithDelay |
| `src/data/helpers.ts` | Add getDisplayStatus(), displayStatusLabel() |
| `src/components/bookings/StatusBadge.tsx` | Accept DisplayStatus, 4 new variants |
| `src/components/bookings/StatusTimeline.tsx` | Delay/reschedule events with colored dots |
| `src/pages/customer/BookingDetailPage.tsx` | Integrate DelayBanner + CriticalDelayModal |
| `src/pages/technician/TechnicianJobDetailPage.tsx` | SmartDelayPrompt + delay buttons |
| `src/pages/vendor/VendorRequestDetailPage.tsx` | DelayBanner + reschedule actions |
| `src/pages/admin/AdminBookingDetailPage.tsx` | DelayBanner + force-reschedule + reassign |
| `src/index.css` | 4 new badge classes + delay banner utilities |

### 6.3 Notification Architecture

Backend owns channel routing. Frontend calls `delayService.reportDelay()` and the backend fans out:
- In-app: creates Notification record (polled by frontend)
- WhatsApp: calls provider API (Phase 2)

```typescript
interface NotificationPayload {
  recipient_user_id: string
  recipient_role: string
  type: 'delay' | 'reschedule'
  title: string
  body: string
  booking_id: string
  action_url?: string
}

interface NotificationChannel {
  send(payload: NotificationPayload): Promise<void>
}
```

### 6.4 Polling Strategy

- Bookings scheduled today: poll `getById()` every 10 seconds
- `useBookingPolling` hook with `document.visibilityState` awareness
- Phase 2: WebSocket replaces polling for active bookings

### 6.5 Store Changes

No new Zustand store. Delay data comes from API as part of `BookingWithDelay` response. Existing polling picks up changes.

---

## 7. Phased Roadmap

### Phase 1 -- MVP (Core Delay Communication)

- DelayEvent types + service + getDisplayStatus utility
- StatusBadge 4 new variants + CSS
- StatusTimeline delay event rendering
- Technician: ReportDelaySheet + CannotAttendSheet + action buttons
- Client: DelayBanner (banner) + CriticalDelayModal (cannot attend)
- Client response: Accept ETA, Cancel
- Vendor/Admin: DelayBanner (read + reassign)
- In-app notifications
- 10s polling for today's bookings
- Feature flag: `delay_reporting_enabled`

### Phase 2 -- Enhanced (Reschedule + WhatsApp)

- RescheduleRequest types + service + sheet
- Client/vendor/admin reschedule propose/accept/counter flows
- Admin force-reschedule with 24h auto-confirm
- Max 3 enforcement
- SmartDelayPrompt
- WhatsApp channel adapter
- Expiry timers
- Feature flag: `reschedule_enabled`

### Phase 3 -- Premium Automation

- WebSocket real-time
- Auto-reassignment suggestions
- Delay analytics dashboard
- SLA tracking
- CSAT impact measurement

---

## 8. Success Metrics

| Metric | Phase 1 Target | Phase 3 Target |
|--------|----------------|----------------|
| Delay acknowledgment rate | 70% within 15 min | 90% |
| Successful reschedule rate | 50% rescheduled vs cancelled | 75% |
| Cancellation on delay | < 40% | < 20% |
| Mean time to client notification | < 2 min | < 10 sec |
| CSAT on delayed bookings | Baseline established | +15% vs Phase 1 |

---

## 9. Definition of Done (Phase 1)

- [ ] All types, services, utilities, and components implemented
- [ ] getDisplayStatus() passes all unit tests
- [ ] DelayBanner renders correctly in all 4 portals with role-based actions
- [ ] CriticalDelayModal opens for cannot_attend, client can respond
- [ ] Technician can report delay from job detail page
- [ ] StatusBadge shows all 11 display statuses
- [ ] StatusTimeline renders delay events with color-coded dots
- [ ] 10s polling for today's bookings, pauses on tab hidden
- [ ] All interactive elements >= 44x44px touch target
- [ ] Mobile layout verified at 375px
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] npm run build succeeds
- [ ] Component tests pass for all new components
- [ ] No regressions in existing booking flows
