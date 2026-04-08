import { BookingStatus, Role } from '@/database/entities';
import {
  ALLOWED_TRANSITIONS,
  BookingEvent,
  applyTransition,
  canTransition,
} from './lifecycle';

const ALL_STATES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.ASSIGNED,
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.REJECTED,
];

const ALL_EVENTS: BookingEvent[] = [
  'assign',
  'accept',
  'reject',
  'start',
  'complete',
  'cancel',
];

const ALL_ROLES: Role[] = [
  Role.CUSTOMER,
  Role.VENDOR,
  Role.TECHNICIAN,
  Role.ADMIN,
];

const TERMINAL_STATES = [
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.REJECTED,
];

describe('lifecycle state machine', () => {
  describe('terminal states', () => {
    it.each(TERMINAL_STATES)(
      '%s allows no transitions for any event or role',
      (state) => {
        for (const event of ALL_EVENTS) {
          for (const role of ALL_ROLES) {
            expect(canTransition(state, event, role)).toBe(false);
          }
          expect(applyTransition(state, event)).toBeNull();
        }
      },
    );
  });

  describe('pending', () => {
    it('admin can assign → assigned', () => {
      expect(canTransition(BookingStatus.PENDING, 'assign', Role.ADMIN)).toBe(
        true,
      );
      expect(applyTransition(BookingStatus.PENDING, 'assign')).toBe(
        BookingStatus.ASSIGNED,
      );
    });

    it('non-admin cannot assign', () => {
      for (const role of [Role.CUSTOMER, Role.VENDOR, Role.TECHNICIAN]) {
        expect(canTransition(BookingStatus.PENDING, 'assign', role)).toBe(
          false,
        );
      }
    });

    it('customer and admin can cancel', () => {
      expect(canTransition(BookingStatus.PENDING, 'cancel', Role.CUSTOMER)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.PENDING, 'cancel', Role.ADMIN)).toBe(
        true,
      );
    });

    it('vendor/technician cannot cancel pending', () => {
      expect(canTransition(BookingStatus.PENDING, 'cancel', Role.VENDOR)).toBe(
        false,
      );
      expect(
        canTransition(BookingStatus.PENDING, 'cancel', Role.TECHNICIAN),
      ).toBe(false);
    });

    it('no other events are valid from pending', () => {
      for (const event of ['accept', 'reject', 'start', 'complete'] as const) {
        for (const role of ALL_ROLES) {
          expect(canTransition(BookingStatus.PENDING, event, role)).toBe(false);
        }
      }
    });
  });

  describe('assigned', () => {
    it('vendor or admin can accept', () => {
      expect(canTransition(BookingStatus.ASSIGNED, 'accept', Role.VENDOR)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.ASSIGNED, 'accept', Role.ADMIN)).toBe(
        true,
      );
      expect(applyTransition(BookingStatus.ASSIGNED, 'accept')).toBe(
        BookingStatus.ACCEPTED,
      );
    });

    it('only vendor can reject → back to pending', () => {
      expect(canTransition(BookingStatus.ASSIGNED, 'reject', Role.VENDOR)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.ASSIGNED, 'reject', Role.ADMIN)).toBe(
        false,
      );
      expect(applyTransition(BookingStatus.ASSIGNED, 'reject')).toBe(
        BookingStatus.PENDING,
      );
    });

    it('customer or admin can cancel', () => {
      expect(canTransition(BookingStatus.ASSIGNED, 'cancel', Role.CUSTOMER)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.ASSIGNED, 'cancel', Role.ADMIN)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.ASSIGNED, 'cancel', Role.VENDOR)).toBe(
        false,
      );
    });
  });

  describe('accepted', () => {
    it('vendor, technician, and admin can start', () => {
      expect(canTransition(BookingStatus.ACCEPTED, 'start', Role.VENDOR)).toBe(
        true,
      );
      expect(
        canTransition(BookingStatus.ACCEPTED, 'start', Role.TECHNICIAN),
      ).toBe(true);
      expect(canTransition(BookingStatus.ACCEPTED, 'start', Role.ADMIN)).toBe(
        true,
      );
      expect(applyTransition(BookingStatus.ACCEPTED, 'start')).toBe(
        BookingStatus.IN_PROGRESS,
      );
    });

    it('customer cannot start', () => {
      expect(canTransition(BookingStatus.ACCEPTED, 'start', Role.CUSTOMER)).toBe(
        false,
      );
    });

    it('customer or admin can still cancel before start', () => {
      expect(
        canTransition(BookingStatus.ACCEPTED, 'cancel', Role.CUSTOMER),
      ).toBe(true);
      expect(canTransition(BookingStatus.ACCEPTED, 'cancel', Role.ADMIN)).toBe(
        true,
      );
      expect(canTransition(BookingStatus.ACCEPTED, 'cancel', Role.VENDOR)).toBe(
        false,
      );
    });
  });

  describe('in_progress', () => {
    it('vendor, technician, and admin can complete', () => {
      for (const role of [Role.VENDOR, Role.TECHNICIAN, Role.ADMIN]) {
        expect(canTransition(BookingStatus.IN_PROGRESS, 'complete', role)).toBe(
          true,
        );
      }
      expect(applyTransition(BookingStatus.IN_PROGRESS, 'complete')).toBe(
        BookingStatus.COMPLETED,
      );
    });

    it('only admin can cancel once in progress', () => {
      expect(
        canTransition(BookingStatus.IN_PROGRESS, 'cancel', Role.ADMIN),
      ).toBe(true);
      expect(
        canTransition(BookingStatus.IN_PROGRESS, 'cancel', Role.CUSTOMER),
      ).toBe(false);
      expect(
        canTransition(BookingStatus.IN_PROGRESS, 'cancel', Role.VENDOR),
      ).toBe(false);
    });
  });

  describe('applyTransition', () => {
    it('returns null for invalid transitions', () => {
      expect(applyTransition(BookingStatus.PENDING, 'accept')).toBeNull();
      expect(applyTransition(BookingStatus.COMPLETED, 'start')).toBeNull();
      expect(applyTransition(BookingStatus.ASSIGNED, 'start')).toBeNull();
    });

    it('reject from assigned returns to pending (re-queuable)', () => {
      expect(applyTransition(BookingStatus.ASSIGNED, 'reject')).toBe(
        BookingStatus.PENDING,
      );
    });
  });

  describe('ALLOWED_TRANSITIONS shape', () => {
    it('covers every non-terminal state', () => {
      for (const state of ALL_STATES) {
        const entry = ALLOWED_TRANSITIONS[state];
        if (TERMINAL_STATES.includes(state)) {
          expect(entry).toEqual({});
        } else {
          expect(entry).toBeDefined();
          expect(Object.keys(entry ?? {}).length).toBeGreaterThan(0);
        }
      }
    });
  });
});
