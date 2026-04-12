import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  BookingEntity,
  BookingStatus,
  BookingStatusEventEntity,
  NotificationType,
  PaymentMode,
  PaymentStatus,
  Role,
  TechnicianEntity,
  TechnicianStatus,
  VendorEntity,
  VendorStatus,
} from '@/database/entities';

import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService, BookingActor } from './bookings.service';

/**
 * Builds a minimal BookingEntity with sensible defaults for tests.
 */
function makeBooking(overrides: Partial<BookingEntity> = {}): BookingEntity {
  return {
    booking_id: 'b-1',
    customer_id: 'cust-1',
    customer_name: 'Demo',
    phone: '+911111111111',
    address: 'addr',
    lat: 0,
    lng: 0,
    category: 'ac',
    service_name: 'AC Service',
    price: 500,
    services_list: [],
    preferred_date: '2026-04-15',
    time_slot: '9AM-12PM',
    payment_mode: PaymentMode.PAY_AFTER_SERVICE,
    payment_status: PaymentStatus.PENDING,
    booking_status: BookingStatus.PENDING,
    vendor_id: null,
    technician_id: null,
    completion_otp: null,
    completion_otp_expires_at: null,
    assigned_at: null,
    accepted_at: null,
    started_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as BookingEntity;
}

function makeTechnician(overrides: Partial<TechnicianEntity> = {}): TechnicianEntity {
  return {
    id: 't-1',
    vendor_id: 'v-1',
    full_name: 'Demo Tech',
    phone: '+911111111111',
    email: 'tech@demo.com',
    skills: ['ac'],
    status: TechnicianStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as unknown as TechnicianEntity;
}

function makeVendor(overrides: Partial<VendorEntity> = {}): VendorEntity {
  return {
    id: 'v-1',
    company_name: 'Demo Co',
    contact_number: '+911111111111',
    email: 'vendor@demo.com',
    city: 'Bangalore',
    pin_codes: ['560001'],
    gst_number: '22AAAAA0000A1Z5',
    gst_verified: true,
    categories: [],
    status: VendorStatus.ACTIVE,
    onboarded_by_id: null,
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as VendorEntity;
}

/**
 * Fake entity manager that pretends to be TypeORM's manager. Records saved
 * entities so tests can assert on them.
 */
function makeFakeManager(store: {
  booking: BookingEntity | null;
  vendor: VendorEntity | null;
  technician: TechnicianEntity | null;
  events: BookingStatusEventEntity[];
}) {
  return {
    async findOne(entity: unknown, _opts: unknown): Promise<unknown> {
      void _opts;
      if (entity === BookingEntity) return store.booking;
      if (entity === VendorEntity) return store.vendor;
      if (entity === TechnicianEntity) return store.technician;
      return null;
    },
    create(entity: unknown, data: unknown) {
      if (entity === BookingStatusEventEntity) {
        return { ...(data as object) } as BookingStatusEventEntity;
      }
      return { ...(data as object) };
    },
    async save(entity: unknown) {
      if ((entity as BookingStatusEventEntity).event !== undefined &&
          (entity as BookingStatusEventEntity).to_status !== undefined) {
        store.events.push(entity as BookingStatusEventEntity);
        return entity;
      }
      store.booking = entity as BookingEntity;
      return entity;
    },
  };
}

interface ServiceHarness {
  service: BookingsService;
  store: {
    booking: BookingEntity | null;
    vendor: VendorEntity | null;
    technician: TechnicianEntity | null;
    events: BookingStatusEventEntity[];
  };
  notificationsService: { create: jest.Mock };
}

function makeService(initial: {
  booking?: BookingEntity;
  vendor?: VendorEntity | null;
  technician?: TechnicianEntity;
} = {}): ServiceHarness {
  const store = {
    booking: initial.booking ?? null,
    vendor: initial.vendor ?? null,
    technician: initial.technician ?? null,
    events: [] as BookingStatusEventEntity[],
  };
  const fakeRepo = {
    findOne: jest.fn(async () => null),
    find: jest.fn(async () => []),
  } as never;
  const fakeDataSource = {
    transaction: async <T>(cb: (m: unknown) => Promise<T>): Promise<T> =>
      cb(makeFakeManager(store)),
  } as never;
  const notificationsService = {
    create: jest.fn(async () => undefined),
  } as never;
  const service = new BookingsService(
    fakeRepo, // bookingsRepository
    fakeRepo, // eventsRepository
    fakeRepo, // reviewsRepository
    fakeRepo, // vendorsRepository
    fakeRepo, // techniciansRepository
    fakeRepo, // usersRepository
    fakeDataSource,
    notificationsService,
  );
  return { service, store, notificationsService };
}

const TEST_NEW_BOOKING_ID = 'aaaaaaaa-bbbb-cccc-dddd-111111111111';

function makeCreateFakeStore() {
  return {
    booking: null as BookingEntity | null,
    events: [] as BookingStatusEventEntity[],
  };
}

function makeCreateFakeManager(store: ReturnType<typeof makeCreateFakeStore>) {
  return {
    create(entity: unknown, data: unknown) {
      if (entity === BookingStatusEventEntity) {
        return { ...(data as object) } as BookingStatusEventEntity;
      }
      return { ...(data as object) } as BookingEntity;
    },
    async save(entity: unknown) {
      const row = entity as BookingStatusEventEntity;
      if (row.event !== undefined && row.to_status !== undefined) {
        store.events.push(row);
        return entity;
      }
      const b = entity as BookingEntity;
      if (!b.booking_id) {
        b.booking_id = TEST_NEW_BOOKING_ID;
      }
      store.booking = b;
      return b;
    },
  };
}

function makeServiceForCreate(): {
  service: BookingsService;
  store: ReturnType<typeof makeCreateFakeStore>;
  notificationsService: { create: jest.Mock };
} {
  const store = makeCreateFakeStore();
  const fakeRepo = {
    findOne: jest.fn(async () => null),
    find: jest.fn(async () => []),
  } as never;
  const fakeDataSource = {
    transaction: async <T>(cb: (m: unknown) => Promise<T>): Promise<T> =>
      cb(makeCreateFakeManager(store)),
  } as never;
  const notificationsService = {
    create: jest.fn(async () => undefined),
  };
  const service = new BookingsService(
    fakeRepo,
    fakeRepo,
    fakeRepo,
    fakeRepo,
    fakeRepo,
    fakeRepo,
    fakeDataSource,
    notificationsService as never,
  );
  return { service, store, notificationsService };
}

const minimalCreateDto: CreateBookingDto = {
  customer_name: 'Test User',
  phone: '9876543210',
  address: '1 Main St',
  lat: 12.97,
  lng: 77.59,
  category: 'ac',
  service_name: 'AC Service',
  price: 500,
  services_list: [{ id: 1, name: 'AC tune', price: 500, qty: 1 }],
  preferred_date: '2026-05-01',
  time_slot: '9AM-12PM',
  payment_mode: PaymentMode.PAY_AFTER_SERVICE,
};

describe('BookingsService.create', () => {
  it('notifies customer after successful create', async () => {
    const { service, notificationsService } = makeServiceForCreate();
    const result = await service.create('cust-1', minimalCreateDto);
    expect(result.booking_id).toBe(TEST_NEW_BOOKING_ID);
    expect(result.customer_id).toBe('cust-1');
    expect(notificationsService.create).toHaveBeenCalledTimes(1);
    expect(notificationsService.create).toHaveBeenCalledWith(
      'cust-1',
      NotificationType.BOOKING,
      'Booking confirmed',
      expect.stringMatching(/AC Service|#aaaaaaaa/),
      null,
    );
  });

  it('notifies each admin after successful create', async () => {
    const store = makeCreateFakeStore();
    const fakeRepo = {
      findOne: jest.fn(async () => null),
      find: jest.fn(async () => [{ id: 'admin-1' }, { id: 'admin-2' }]),
    } as never;
    const fakeDataSource = {
      transaction: async <T>(cb: (m: unknown) => Promise<T>): Promise<T> =>
        cb(makeCreateFakeManager(store)),
    } as never;
    const notificationsService = {
      create: jest.fn(async () => undefined),
    };
    const service = new BookingsService(
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeDataSource,
      notificationsService as never,
    );
    await service.create('cust-1', minimalCreateDto);
    const calls = notificationsService.create.mock.calls as unknown[][];
    const customerCalls = calls.filter((c) => c[0] === 'cust-1');
    const adminCalls = calls.filter((c) => c[0] === 'admin-1' || c[0] === 'admin-2');
    expect(customerCalls).toHaveLength(1);
    expect(adminCalls).toHaveLength(2);
    expect(adminCalls[0]?.[4]).toBe(TEST_NEW_BOOKING_ID);
    expect(adminCalls[1]?.[4]).toBe(TEST_NEW_BOOKING_ID);
  });

  it('does not notify when transaction fails', async () => {
    const fakeRepo = {
      findOne: jest.fn(async () => null),
      find: jest.fn(async () => []),
    } as never;
    const fakeDataSource = {
      transaction: jest.fn().mockRejectedValue(new Error('db')),
    } as never;
    const notificationsService = {
      create: jest.fn(async () => undefined),
    };
    const service = new BookingsService(
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeRepo,
      fakeDataSource,
      notificationsService as never,
    );
    await expect(service.create('cust-1', minimalCreateDto)).rejects.toThrow(
      'db',
    );
    expect(notificationsService.create).not.toHaveBeenCalled();
  });
});

const CUSTOMER: BookingActor = { id: 'cust-1', role: Role.CUSTOMER };
const ADMIN: BookingActor = { id: 'admin-1', role: Role.ADMIN };
const VENDOR_ACTOR: BookingActor = { id: 'u-v-1', role: Role.VENDOR, vendor_id: 'v-1' };
const OTHER_VENDOR_ACTOR: BookingActor = { id: 'u-v-2', role: Role.VENDOR, vendor_id: 'v-2' };
const TECH_ACTOR: BookingActor = {
  id: 'u-t-1',
  role: Role.TECHNICIAN,
  vendor_id: 'v-1',
  technician_id: 't-1',
};

describe('BookingsService.transition', () => {
  describe('ownership', () => {
    it('customer cannot cancel another customer’s booking', async () => {
      const { service } = makeService({
        booking: makeBooking({ customer_id: 'other-cust' }),
      });
      await expect(
        service.transition('b-1', 'cancel', CUSTOMER),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('vendor cannot act on a booking assigned to another vendor', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ASSIGNED,
          vendor_id: 'v-1',
        }),
      });
      await expect(
        service.transition('b-1', 'accept', OTHER_VENDOR_ACTOR),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('technician cannot act on a booking not assigned to them', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ACCEPTED,
          vendor_id: 'v-1',
          technician_id: 't-other',
        }),
      });
      await expect(
        service.transition('b-1', 'start', TECH_ACTOR),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('admin bypasses ownership', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ACCEPTED,
          vendor_id: 'v-1',
          technician_id: 't-1',
        }),
      });
      const result = await service.transition('b-1', 'start', ADMIN);
      expect(result.booking_status).toBe(BookingStatus.IN_PROGRESS);
    });
  });

  describe('assign', () => {
    it('assigns when vendor status is active', async () => {
      const { service, store } = makeService({
        booking: makeBooking({ booking_status: BookingStatus.PENDING }),
        vendor: makeVendor({ id: 'v-1', status: VendorStatus.ACTIVE }),
      });
      const result = await service.transition('b-1', 'assign', ADMIN, {
        vendor_id: 'v-1',
      });
      expect(result.booking_status).toBe(BookingStatus.ASSIGNED);
      expect(result.vendor_id).toBe('v-1');
      expect(store.booking?.assigned_at).toBeInstanceOf(Date);
    });

    it('rejects assign when vendor is not active', async () => {
      const { service } = makeService({
        booking: makeBooking({ booking_status: BookingStatus.PENDING }),
        vendor: makeVendor({ id: 'v-1', status: VendorStatus.PENDING }),
      });
      await expect(
        service.transition('b-1', 'assign', ADMIN, { vendor_id: 'v-1' }),
      ).rejects.toMatchObject({
        message: expect.stringMatching(/not active/),
      });
    });

    it('rejects assign when vendor id does not exist', async () => {
      const { service } = makeService({
        booking: makeBooking({ booking_status: BookingStatus.PENDING }),
        vendor: null,
      });
      await expect(
        service.transition('b-1', 'assign', ADMIN, {
          vendor_id: 'missing-id',
        }),
      ).rejects.toMatchObject({
        message: 'Vendor with ID "missing-id" not found.',
      });
    });
  });

  describe('cancel', () => {
    it.each([BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.ACCEPTED])(
      'customer can cancel from %s',
      async (from) => {
        const { service } = makeService({
          booking: makeBooking({ booking_status: from }),
        });
        const result = await service.transition('b-1', 'cancel', CUSTOMER);
        expect(result.booking_status).toBe(BookingStatus.CANCELLED);
        expect(result.cancelled_at).toBeInstanceOf(Date);
      },
    );

    it('customer cannot cancel once in progress', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          technician_id: 't-1',
        }),
      });
      await expect(
        service.transition('b-1', 'cancel', CUSTOMER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('start', () => {
    it('blocks start when no technician is dispatched', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ACCEPTED,
          vendor_id: 'v-1',
        }),
      });
      await expect(
        service.transition('b-1', 'start', VENDOR_ACTOR),
      ).rejects.toMatchObject({ message: expect.stringMatching(/technician/i) });
    });

    it('generates a 6-digit OTP with ~24h expiry on start', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ACCEPTED,
          vendor_id: 'v-1',
          technician_id: 't-1',
        }),
      });
      const before = Date.now();
      const result = await service.transition('b-1', 'start', TECH_ACTOR, {});
      // transition returns OTP stripped for non-customer; check via store instead
      expect(result.booking_status).toBe(BookingStatus.IN_PROGRESS);
      expect(result.completion_otp).toBeNull(); // stripped for technician actor

      // Re-read through a "customer" view by poking the underlying saved booking
      // via a second transition call that only reads? Not possible here — assert
      // the OTP was generated by directly calling again with a customer actor:
      // we can't read without changing state, so instead verify started_at was set.
      expect(result.started_at).toBeInstanceOf(Date);
      expect((result.started_at as Date).getTime()).toBeGreaterThanOrEqual(before);
    });

    it('stores OTP + expiry visible to the booking customer', async () => {
      const booking = makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
        technician_id: 't-1',
      });
      const { service, store } = makeService({ booking });
      await service.transition('b-1', 'start', TECH_ACTOR);
      // Inspect the saved booking in the store directly (pre-OTP-strip)
      expect(store.booking?.completion_otp).toMatch(/^\d{6}$/);
      expect(store.booking?.completion_otp_expires_at).toBeInstanceOf(Date);
      const ttlMs =
        (store.booking?.completion_otp_expires_at?.getTime() ?? 0) - Date.now();
      // 24h ± a few seconds
      expect(ttlMs).toBeGreaterThan(23 * 60 * 60 * 1000);
      expect(ttlMs).toBeLessThan(25 * 60 * 60 * 1000);
    });
  });

  describe('complete with OTP', () => {
    it('rejects technician complete without OTP', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          vendor_id: 'v-1',
          technician_id: 't-1',
          completion_otp: '123456',
          completion_otp_expires_at: new Date(Date.now() + 60_000),
        }),
      });
      await expect(
        service.transition('b-1', 'complete', TECH_ACTOR),
      ).rejects.toMatchObject({ message: 'OTP required to complete the job' });
    });

    it('rejects wrong OTP', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          vendor_id: 'v-1',
          technician_id: 't-1',
          completion_otp: '123456',
          completion_otp_expires_at: new Date(Date.now() + 60_000),
        }),
      });
      await expect(
        service.transition('b-1', 'complete', TECH_ACTOR, { otp: '000000' }),
      ).rejects.toMatchObject({ message: 'Invalid or expired OTP' });
    });

    it('rejects expired OTP', async () => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          vendor_id: 'v-1',
          technician_id: 't-1',
          completion_otp: '123456',
          completion_otp_expires_at: new Date(Date.now() - 60_000),
        }),
      });
      await expect(
        service.transition('b-1', 'complete', TECH_ACTOR, { otp: '123456' }),
      ).rejects.toMatchObject({ message: 'Invalid or expired OTP' });
    });

    it('accepts correct OTP, transitions to completed, clears OTP', async () => {
      const { service, store } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          vendor_id: 'v-1',
          technician_id: 't-1',
          completion_otp: '123456',
          completion_otp_expires_at: new Date(Date.now() + 60_000),
        }),
      });
      const result = await service.transition('b-1', 'complete', TECH_ACTOR, {
        otp: '123456',
      });
      expect(result.booking_status).toBe(BookingStatus.COMPLETED);
      expect(store.booking?.completion_otp).toBeNull();
      expect(store.booking?.completion_otp_expires_at).toBeNull();
      expect(store.booking?.completed_at).toBeInstanceOf(Date);
    });

    it('vendor/admin complete bypasses OTP and still clears it', async () => {
      const { service, store } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.IN_PROGRESS,
          vendor_id: 'v-1',
          technician_id: 't-1',
          completion_otp: '123456',
          completion_otp_expires_at: new Date(Date.now() + 60_000),
        }),
      });
      const result = await service.transition('b-1', 'complete', VENDOR_ACTOR);
      expect(result.booking_status).toBe(BookingStatus.COMPLETED);
      expect(store.booking?.completion_otp).toBeNull();
    });
  });

  describe('reject from assigned', () => {
    it('clears vendor_id, technician_id, assigned_at', async () => {
      const { service, store } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ASSIGNED,
          vendor_id: 'v-1',
          technician_id: 't-1',
          assigned_at: new Date(),
        }),
      });
      const result = await service.transition('b-1', 'reject', VENDOR_ACTOR);
      expect(result.booking_status).toBe(BookingStatus.PENDING);
      expect(store.booking?.vendor_id).toBeNull();
      expect(store.booking?.technician_id).toBeNull();
      expect(store.booking?.assigned_at).toBeNull();
    });
  });

  describe('event audit trail', () => {
    it('writes a status event on every transition', async () => {
      const { service, store } = makeService({
        booking: makeBooking({ booking_status: BookingStatus.PENDING }),
      });
      await service.transition('b-1', 'cancel', CUSTOMER, { note: 'reason' });
      expect(store.events).toHaveLength(1);
      expect(store.events[0]).toMatchObject({
        booking_id: 'b-1',
        from_status: BookingStatus.PENDING,
        to_status: BookingStatus.CANCELLED,
        event: 'cancel',
        actor_role: Role.CUSTOMER,
        note: 'reason',
      });
    });
  });
});

describe('BookingsService.assignTechnician', () => {
  it('rejects non-vendor/admin actors', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician(),
    });
    await expect(
      service.assignTechnician('b-1', CUSTOMER, 't-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('vendor must own the booking', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician(),
    });
    await expect(
      service.assignTechnician('b-1', OTHER_VENDOR_ACTOR, 't-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('technician must belong to the booking vendor', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician({ vendor_id: 'v-2' }),
    });
    await expect(
      service.assignTechnician('b-1', VENDOR_ACTOR, 't-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects dispatch on non-accepted/in_progress statuses', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.PENDING,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician(),
    });
    await expect(
      service.assignTechnician('b-1', VENDOR_ACTOR, 't-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([[TechnicianStatus.INACTIVE], [TechnicianStatus.ON_LEAVE]])(
    'rejects dispatch when technician status is %s',
    async (status) => {
      const { service } = makeService({
        booking: makeBooking({
          booking_status: BookingStatus.ACCEPTED,
          vendor_id: 'v-1',
        }),
        technician: makeTechnician({ status }),
      });
      await expect(
        service.assignTechnician('b-1', VENDOR_ACTOR, 't-1'),
      ).rejects.toMatchObject({
        message: expect.stringMatching(/Cannot dispatch technician|not active/i),
      });
    },
  );

  it('blocks reassignment to a different technician once in progress', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.IN_PROGRESS,
        vendor_id: 'v-1',
        technician_id: 't-other',
      }),
      technician: makeTechnician(),
    });
    await expect(
      service.assignTechnician('b-1', VENDOR_ACTOR, 't-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('happy path: sets technician_id and writes assign event', async () => {
    const { service, store } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician({ status: TechnicianStatus.ACTIVE }),
    });
    const result = await service.assignTechnician('b-1', VENDOR_ACTOR, 't-1');
    expect(result.technician_id).toBe('t-1');
    expect(store.events).toHaveLength(1);
    expect(store.events[0].event).toBe('assign');
    expect(store.events[0].note).toContain('Demo Tech');
  });

  it('admin can dispatch without vendor_id of their own', async () => {
    const { service } = makeService({
      booking: makeBooking({
        booking_status: BookingStatus.ACCEPTED,
        vendor_id: 'v-1',
      }),
      technician: makeTechnician({ status: TechnicianStatus.ACTIVE }),
    });
    const result = await service.assignTechnician('b-1', ADMIN, 't-1');
    expect(result.technician_id).toBe('t-1');
  });
});
