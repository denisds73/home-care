import { BookingStatus, Role } from '@/database/entities';

export type BookingEvent =
  | 'assign'
  | 'accept'
  | 'reject'
  | 'start'
  | 'complete'
  | 'cancel';

export interface TransitionRule {
  next: BookingStatus;
  allowedRoles: Role[];
}

export type TransitionMap = {
  [K in BookingStatus]?: Partial<Record<BookingEvent, TransitionRule>>;
};

export const ALLOWED_TRANSITIONS: TransitionMap = {
  [BookingStatus.PENDING]: {
    assign: { next: BookingStatus.ASSIGNED, allowedRoles: [Role.ADMIN] },
    cancel: {
      next: BookingStatus.CANCELLED,
      allowedRoles: [Role.CUSTOMER, Role.ADMIN],
    },
  },
  [BookingStatus.ASSIGNED]: {
    accept: {
      next: BookingStatus.ACCEPTED,
      allowedRoles: [Role.VENDOR, Role.ADMIN],
    },
    reject: { next: BookingStatus.PENDING, allowedRoles: [Role.VENDOR] },
    cancel: {
      next: BookingStatus.CANCELLED,
      allowedRoles: [Role.CUSTOMER, Role.ADMIN],
    },
  },
  [BookingStatus.ACCEPTED]: {
    start: {
      next: BookingStatus.IN_PROGRESS,
      allowedRoles: [Role.VENDOR, Role.TECHNICIAN, Role.ADMIN],
    },
    cancel: {
      next: BookingStatus.CANCELLED,
      allowedRoles: [Role.CUSTOMER, Role.ADMIN],
    },
  },
  [BookingStatus.IN_PROGRESS]: {
    complete: {
      next: BookingStatus.COMPLETED,
      allowedRoles: [Role.VENDOR, Role.TECHNICIAN, Role.ADMIN],
    },
    cancel: { next: BookingStatus.CANCELLED, allowedRoles: [Role.ADMIN] },
  },
  [BookingStatus.COMPLETED]: {},
  [BookingStatus.CANCELLED]: {},
  [BookingStatus.REJECTED]: {},
};

export function canTransition(
  status: BookingStatus,
  event: BookingEvent,
  role: Role,
): boolean {
  const rule = ALLOWED_TRANSITIONS[status]?.[event];
  if (!rule) return false;
  return rule.allowedRoles.includes(role);
}

export function applyTransition(
  status: BookingStatus,
  event: BookingEvent,
): BookingStatus | null {
  const rule = ALLOWED_TRANSITIONS[status]?.[event];
  return rule ? rule.next : null;
}
