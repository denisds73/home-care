# Service Delay Communication — Implementation Checklist

> **Date**: 2026-04-13
> **Spec**: `2026-04-13-service-delay-communication-design.md`

---

## Phase 1 — MVP (Core Delay Communication)

### Types & Utilities

- [ ] Create `src/types/delay.ts` with DelayEvent, DelayType, DelayReason, RescheduleRequest, RescheduleStatus, DisplayStatus, BookingWithDelay
- [ ] Update `src/types/domain.ts` to import/re-export delay types, extend NotificationType with 'delay' | 'reschedule'
- [ ] Create `src/utils/delayReasons.ts` with reason taxonomy constants + human-readable labels for all DelayReason values
- [ ] Create `src/utils/getDisplayStatus.ts` with pure function implementing priority resolution (reschedule > cannot_attend > running_late > base)
- [ ] Add `displayStatusLabel()` to `src/data/helpers.ts`

### Services

- [ ] Create `src/services/delayService.ts`:
  - `reportDelay(bookingId, payload)` -- POST /bookings/:id/delay
  - `updateDelay(bookingId, delayId, payload)` -- PATCH /bookings/:id/delay/:delayId
  - `respondToDelay(bookingId, delayId, response)` -- POST /bookings/:id/delay/:delayId/respond
  - `getDelayEvents(bookingId)` -- GET /bookings/:id/delay-events

### CSS

- [ ] Add to `src/index.css`:
  - `.badge-delayed` (amber: bg #FEF3C7, color #92400E)
  - `.badge-cannot-attend` (red: bg #FEE2E2, color #991B1B)
  - `.badge-rescheduling` (purple: bg #EDE9FE, color #4C1D95)
  - `.badge-rescheduled` (blue: bg #DBEAFE, color #1E40AF)

### Shared Components

- [ ] Create `src/components/delay/DelayReasonPicker.tsx` -- chip-based single-select, accepts `delayType` to filter reason set
- [ ] Create `src/components/delay/RevisedEtaPicker.tsx` -- time selector, enforces future-only times
- [ ] Create `src/components/delay/DelayBanner.tsx` -- role-aware inline alert:
  - Warning variant (running_late): gradient top-edge, clock icon, ETA comparison, action buttons
  - Error variant (cannot_attend): red gradient, X icon, reason + note
  - Customer actions: Accept ETA, Reschedule, Cancel
  - Vendor/Admin actions: Reassign Technician, Reschedule
  - Props: `delay: DelayEvent`, `booking: Booking`, `role: string`, `onAccept`, `onReschedule`, `onCancel`, `onReassign`
- [ ] Create `src/components/delay/CriticalDelayModal.tsx` -- bottom sheet:
  - Cannot attend variant: error icon, reason card, Reschedule / Different Tech / Cancel
  - Props: `isOpen`, `onClose`, `delay: DelayEvent`, `booking: Booking`, `onReschedule`, `onRequestDifferentTech`, `onCancel`
- [ ] Create `src/components/delay/index.ts` -- barrel export

### Technician Components

- [ ] Create `src/components/delay/ReportDelaySheet.tsx`:
  - DelayReasonPicker (running_late reasons)
  - RevisedEtaPicker
  - Optional note textarea
  - Submit validates: reason required, ETA required
  - Calls `delayService.reportDelay()`
- [ ] Create `src/components/delay/CannotAttendSheet.tsx`:
  - DelayReasonPicker (cannot_attend reasons)
  - Required note textarea
  - Submit validates: reason required, note required
  - Calls `delayService.reportDelay()` with delay_type: 'cannot_attend'

### Modified Components

- [ ] Update `src/components/bookings/StatusBadge.tsx`:
  - Accept `DisplayStatus` (union of BookingStatus + 4 new)
  - Add 4 new VARIANT entries
  - Add labels for new statuses
- [ ] Update `src/components/bookings/StatusTimeline.tsx`:
  - Add EVENT_LABEL entries: 'delay_reported', 'delay_updated', 'delay_accepted', 'reschedule_proposed', 'reschedule_accepted', 'reschedule_rejected'
  - Color-coded dots: warning (delay), error (cannot_attend), brand (reschedule), success (resolved)

### Page Integrations

- [ ] Update `src/pages/technician/TechnicianJobDetailPage.tsx`:
  - Add "Report Delay" and "Cannot Attend" buttons below Start Service
  - Open ReportDelaySheet / CannotAttendSheet on tap
  - Show "Update Delay" instead of "Report Delay" when active delay exists
  - Hide delay buttons for non-reportable statuses (completed, cancelled, rejected)
- [ ] Update `src/pages/customer/BookingDetailPage.tsx`:
  - Show DelayBanner when active_delay exists (running_late)
  - Show CriticalDelayModal when active_delay is cannot_attend
  - Wire Accept ETA -> delayService.respondToDelay()
  - Wire Cancel -> bookingService.cancel()
- [ ] Update `src/pages/vendor/VendorRequestDetailPage.tsx`:
  - Show DelayBanner with vendor actions (Reassign, Reschedule)
  - Show client response status on banner
- [ ] Update `src/pages/admin/AdminBookingDetailPage.tsx`:
  - Show DelayBanner with admin actions (Reassign, Reschedule)
  - Show client response status on banner

### Polling

- [ ] Create `src/hooks/useBookingPolling.ts`:
  - Accepts bookingId and preferred_date
  - If preferred_date === today, polls getById() every 10 seconds
  - Pauses on document.visibilityState === 'hidden'
  - Returns fresh BookingWithDelay data
- [ ] Integrate useBookingPolling in all 4 portal detail pages

### Tests

- [ ] `src/utils/getDisplayStatus.test.ts` -- all priority combinations, null cases, fallback to base
- [ ] `src/services/delayService.test.ts` -- reportDelay payload, updateDelay, respondToDelay, error handling
- [ ] `src/components/delay/DelayBanner.test.tsx` -- warning/error variants, role-based actions, callbacks
- [ ] `src/components/delay/CriticalDelayModal.test.tsx` -- open/close, all action buttons, escape key
- [ ] `src/components/delay/ReportDelaySheet.test.tsx` -- reason selection, ETA required, submit
- [ ] `src/components/bookings/StatusBadge.test.tsx` -- 11 display statuses, regression on existing 7

### Verification

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] All tests pass
- [ ] Manual verification at 375px viewport
- [ ] Touch targets >= 44x44px
- [ ] No regressions in existing booking list/detail pages

---

## Phase 2 — Enhanced (Reschedule + WhatsApp)

### Types & Services

- [ ] Create `src/services/rescheduleService.ts`:
  - `proposeReschedule(bookingId, payload)` -- POST
  - `respondToReschedule(bookingId, rescheduleId, response)` -- POST
  - `counterPropose(bookingId, rescheduleId, payload)` -- POST
- [ ] Create `src/services/notificationChannel.ts` -- NotificationChannel interface + InAppChannel + WhatsAppChannel

### Components

- [ ] Create `src/components/delay/RescheduleCounter.tsx` -- "1 of 3" dot indicator
- [ ] Create `src/components/delay/RescheduleSheet.tsx`:
  - Date picker (future dates only)
  - Time slot selector (9AM-12PM, 12PM-3PM, 3PM-6PM)
  - DelayReasonPicker (reschedule reasons)
  - Optional note
  - RescheduleCounter
  - Info callout: "Client will be notified"
  - Button text adapts per role: "Propose" vs "Reschedule"
  - Disabled at max 3 reschedules
- [ ] Create `src/components/delay/SmartDelayPrompt.tsx`:
  - Shows when: preferred_date === today, time > slot start, status === accepted, no started_at
  - Two actions: "Yes, Report Delay" (opens ReportDelaySheet) + "I'm Here" (triggers start)
  - Auto-dismisses when delay is reported or service starts
- [ ] Extend CriticalDelayModal with reschedule-proposed variant:
  - Original vs proposed date/time comparison
  - Accept / Suggest Different Time / Cancel

### Page Updates

- [ ] Add SmartDelayPrompt to TechnicianJobDetailPage
- [ ] Add reschedule actions to customer BookingDetailPage (CriticalDelayModal reschedule variant)
- [ ] Add client-initiated reschedule button on BookingDetailPage (opens RescheduleSheet)
- [ ] Add reschedule propose/counter on VendorRequestDetailPage
- [ ] Add force-reschedule on AdminBookingDetailPage

### WhatsApp Integration

- [ ] WhatsApp adapter in notificationChannel.ts
- [ ] Backend handles actual API calls -- frontend only triggers via delay/reschedule service

### Expiry & Reminders (Backend-driven, frontend displays)

- [ ] Display "Awaiting response" / "Reminder sent" / "Expired" states on reschedule banners
- [ ] Handle 409 Conflict for expired reschedule responses

### Tests

- [ ] `src/services/rescheduleService.test.ts`
- [ ] `src/components/delay/RescheduleSheet.test.tsx` -- max 3 enforcement, date validation, role-aware button text
- [ ] `src/components/delay/SmartDelayPrompt.test.tsx` -- visibility conditions, auto-dismiss
- [ ] Integration: technician reports -> client reschedules -> vendor accepts

---

## Phase 3 — Premium Automation

- [ ] WebSocket real-time: `useDelaySubscription` hook replacing polling
- [ ] Auto-reassignment suggestion UI for admin
- [ ] Delay analytics dashboard page
- [ ] SLA tracking components
- [ ] CSAT measurement integration
