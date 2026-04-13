# Service Delay Communication — Test Plan

> **Date**: 2026-04-13
> **Spec**: `2026-04-13-service-delay-communication-design.md`

---

## 1. Unit Tests

### 1.1 getDisplayStatus (src/utils/getDisplayStatus.test.ts)

| # | Scenario | Input | Expected |
|---|----------|-------|----------|
| 1 | No active delay, no reschedule | booking.status = 'accepted', null, null | 'accepted' |
| 2 | Running late | booking.status = 'accepted', delay(running_late, active), null | 'delayed' |
| 3 | Cannot attend | booking.status = 'accepted', delay(cannot_attend, active), null | 'cannot_attend' |
| 4 | Reschedule proposed | booking.status = 'accepted', null, reschedule(proposed) | 'rescheduling' |
| 5 | Reschedule counter-proposed | booking.status = 'accepted', null, reschedule(counter_proposed) | 'rescheduling' |
| 6 | Reschedule accepted | booking.status = 'assigned', null, reschedule(accepted) | 'rescheduled' |
| 7 | Priority: reschedule over delay | booking, delay(running_late), reschedule(proposed) | 'rescheduling' |
| 8 | Priority: cannot_attend over running_late | booking, delay(cannot_attend), null | 'cannot_attend' |
| 9 | Inactive delay falls through | delay.is_active = false | booking.booking_status |
| 10 | Expired reschedule falls through | reschedule.status = 'expired' | booking.booking_status |
| 11 | All null | booking.status = 'pending', null, null | 'pending' |
| 12 | Completed booking ignores delay | booking.status = 'completed', delay(active) | 'completed' |

### 1.2 delayReasons (src/utils/delayReasons.test.ts)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | All DelayReason values have a label | No undefined labels |
| 2 | Running late reasons filtered correctly | Returns traffic, previous_job_overran, vehicle_issue, personal_emergency, other |
| 3 | Cannot attend reasons filtered correctly | Returns sick, vehicle_breakdown, scheduling_conflict, personal_emergency, other |
| 4 | Reschedule reasons filtered correctly | Returns parts_unavailable, schedule_conflict, weather, other |

### 1.3 delayService (src/services/delayService.test.ts)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | reportDelay sends POST with correct payload | api.post called with /bookings/:id/delay |
| 2 | reportDelay includes delay_type, reason, revised_eta, reason_note | Payload shape matches DelayEvent creation DTO |
| 3 | updateDelay sends PATCH | api.patch called with /bookings/:id/delay/:delayId |
| 4 | respondToDelay sends client response | api.post with response type (accepted/reschedule_requested/cancelled) |
| 5 | getDelayEvents returns array | api.get, returns DelayEvent[] |
| 6 | Network error surfaces ApiError | Rejects with structured error, no silent swallowing |
| 7 | 404 on invalid booking | Rejects with meaningful message |

### 1.4 rescheduleService (src/services/rescheduleService.test.ts)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | proposeReschedule sends correct payload | POST with proposed_date, proposed_time_slot, reason |
| 2 | respondToReschedule with accept | Updates status to 'accepted' |
| 3 | respondToReschedule with reject | Updates status to 'rejected' |
| 4 | counterPropose sends counter dates | POST with counter_date, counter_time_slot |
| 5 | 409 Conflict on expired reschedule | Returns structured error |

---

## 2. Component Tests (React Testing Library)

### 2.1 StatusBadge (src/components/bookings/StatusBadge.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Renders 'delayed' display status | badge-delayed class, text "Delayed" |
| 2 | Renders 'cannot_attend' | badge-cannot-attend class, text "Cannot Attend" |
| 3 | Renders 'rescheduling' | badge-rescheduling class, text "Rescheduling" |
| 4 | Renders 'rescheduled' | badge-rescheduled class, text "Rescheduled" |
| 5 | Existing statuses unchanged (regression) | All 7 original statuses render with original classes |

### 2.2 DelayBanner (src/components/delay/DelayBanner.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Running late: warning variant | Warning gradient, clock icon, revised ETA |
| 2 | Cannot attend: error variant | Error gradient, X icon, reason text |
| 3 | Customer role: shows Accept, Reschedule, Cancel | 3 action buttons rendered |
| 4 | Vendor role: shows Reassign, Reschedule | 2 action buttons |
| 5 | Admin role: shows Reassign, Reschedule | 2 action buttons |
| 6 | Accept button fires onAccept | Callback invoked with delay ID |
| 7 | Reschedule button fires onReschedule | Callback invoked |
| 8 | Cancel button fires onCancel | Callback invoked |
| 9 | Shows timestamp "5 min ago" | Relative time display |
| 10 | Shows original vs revised ETA | Strikethrough old, bold new |

### 2.3 CriticalDelayModal (src/components/delay/CriticalDelayModal.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Opens when isOpen=true | Modal visible, body scroll locked |
| 2 | Closed when isOpen=false | Nothing rendered |
| 3 | Escape key closes | onClose called |
| 4 | Backdrop click closes | onClose called |
| 5 | Cannot attend: shows 3 actions | Reschedule, Different Tech, Cancel |
| 6 | Displays reason and note | Reason label + note text from delay |
| 7 | Reschedule button fires callback | onReschedule invoked |
| 8 | Cancel button fires callback | onCancel invoked |
| 9 | Different tech button fires callback | onRequestDifferentTech invoked |

### 2.4 ReportDelaySheet (src/components/delay/ReportDelaySheet.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Renders reason chips for running_late | Traffic, Previous job, Vehicle issue, Personal, Other |
| 2 | Single-select: only one chip active at a time | Click second chip deselects first |
| 3 | ETA picker shows time | Displays formatted time |
| 4 | Submit disabled without reason | Button disabled state |
| 5 | Submit disabled without ETA | Button disabled state |
| 6 | Submit enabled with reason + ETA | Button enabled |
| 7 | Submit calls delayService.reportDelay | Service invoked with correct payload |
| 8 | Optional note included in payload | reason_note field populated |
| 9 | Loading state during submission | Button shows loading, inputs disabled |
| 10 | Error toast on failure | Toast shown, form retains state |

### 2.5 SmartDelayPrompt (src/components/delay/SmartDelayPrompt.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Shows when time > slot start, status=accepted, no started_at | Prompt visible |
| 2 | Hidden when status is not accepted | Prompt not rendered |
| 3 | Hidden when started_at exists | Prompt not rendered |
| 4 | Hidden when preferred_date is not today | Prompt not rendered |
| 5 | "Yes, Report Delay" fires onReportDelay | Callback invoked |
| 6 | "I'm Here" fires onStartService | Callback invoked |

### 2.6 StatusTimeline (src/components/bookings/StatusTimeline.test.tsx)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Existing events render (regression) | All 7 event types render correctly |
| 2 | Delay reported event shows warning dot | timeline-dot--warning class |
| 3 | Cannot attend event shows error dot | timeline-dot--error class |
| 4 | Client accepted event shows brand dot | timeline-dot--brand class |
| 5 | Note text renders in italic | Note element present with italic styling |
| 6 | Events in chronological order | First event at top |

---

## 3. Integration Tests

### 3.1 Technician reports delay -> client accepts

1. Render TechnicianJobDetailPage for accepted booking scheduled today
2. Tap "Report Delay"
3. Select "Traffic" reason chip
4. Set revised ETA
5. Submit
6. Verify delayService.reportDelay called with correct payload
7. Render BookingDetailPage as customer
8. Verify DelayBanner visible with warning variant
9. Tap "Accept ETA"
10. Verify delayService.respondToDelay called with 'accepted'

### 3.2 Cannot attend -> client requests different technician

1. Render TechnicianJobDetailPage
2. Tap "Cannot Attend"
3. Select reason, fill required note
4. Submit
5. Render BookingDetailPage as customer
6. Verify CriticalDelayModal opens automatically
7. Tap "Request Different Technician"
8. Verify notification sent to vendor/admin

### 3.3 Max reschedule enforcement

1. Create booking with reschedule_count = 3
2. Render BookingDetailPage as customer
3. Verify "Reschedule" button is disabled
4. Render VendorRequestDetailPage
5. Verify "Reschedule" button is disabled
6. Render AdminBookingDetailPage
7. Verify "Reschedule" button is disabled

### 3.4 Smart prompt visibility

1. Render TechnicianJobDetailPage for accepted booking
2. Mock current time > slot start, no started_at
3. Verify SmartDelayPrompt visible
4. Tap "I'm Here"
5. Verify prompt dismisses and start service triggered

---

## 4. Failure Mode Tests

| # | Failure | Test |
|---|---------|------|
| 1 | Network error during delay report | Mock api.post to reject. Verify toast error. Verify form retains state. No partial state |
| 2 | Stale booking data | Report delay, then poll returns updated data. Verify UI reconciles |
| 3 | Client responds to expired reschedule | Mock 409 response. Verify "This reschedule has expired" toast |
| 4 | Double-submit prevention | Click submit twice quickly. Verify single API call |
| 5 | Offline state | Mock navigator.onLine = false. Verify "You appear to be offline" toast |
| 6 | Invalid booking status for delay | Attempt delay on completed booking. Verify API returns 400. Button should be hidden in UI |

---

## 5. Accessibility Tests

| # | Check | Method |
|---|-------|--------|
| 1 | CriticalDelayModal traps focus | Tab through modal, verify focus doesn't escape |
| 2 | CriticalDelayModal has role="dialog" aria-modal="true" | DOM inspection |
| 3 | DelayBanner has role="alert" | DOM inspection |
| 4 | All buttons have accessible labels | No icon-only buttons without aria-label |
| 5 | Chip selection announced | aria-pressed on selected chip |
| 6 | Focus visible on all interactive elements | Keyboard navigation test |
| 7 | Color contrast for new badge variants | WCAG AA ratio check (4.5:1 minimum) |

---

## 6. Mobile / Responsive Tests

| # | Check | Viewport |
|---|-------|----------|
| 1 | DelayBanner no horizontal overflow | 375px |
| 2 | CriticalDelayModal readable, buttons reachable | 375px |
| 3 | ReportDelaySheet chips wrap correctly | 375px |
| 4 | RescheduleSheet time slots stack if needed | 320px |
| 5 | All touch targets >= 44x44px | 375px |
| 6 | Text legible at all sizes | 375px - 1280px |

---

## 7. Regression Tests

| # | Check |
|---|-------|
| 1 | Existing booking list pages render without delay data (null active_delay) |
| 2 | Existing StatusBadge with original 7 statuses renders unchanged |
| 3 | Existing StatusTimeline with original 7 event types renders unchanged |
| 4 | Booking creation flow unaffected |
| 5 | OTP completion flow unaffected |
| 6 | Cancel flow unaffected (existing cancel still works) |
| 7 | Admin booking management filters still work |
