import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  Role,
  TechnicianEntity,
  TechnicianStatus,
  UserEntity,
  UserStatus,
} from '@/database/entities';
import { TechniciansService } from './technicians.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed-password'),
}));

interface Store {
  technicians: TechnicianEntity[];
  users: UserEntity[];
}

function makeService(initial: Partial<Store> = {}) {
  const store: Store = {
    technicians: initial.technicians ?? [],
    users: initial.users ?? [],
  };

  const techRepo = {
    findOne: jest.fn(async ({ where }: { where: Partial<TechnicianEntity> }) => {
      return (
        store.technicians.find((t) =>
          Object.entries(where).every(
            ([k, v]) => (t as unknown as Record<string, unknown>)[k] === v,
          ),
        ) ?? null
      );
    }),
    find: jest.fn(async ({ where }: { where: Partial<TechnicianEntity> }) => {
      return store.technicians.filter((t) =>
        Object.entries(where).every(
          ([k, v]) => (t as unknown as Record<string, unknown>)[k] === v,
        ),
      );
    }),
    save: jest.fn(async (entity: TechnicianEntity) => {
      const idx = store.technicians.findIndex((t) => t.id === entity.id);
      if (idx >= 0) store.technicians[idx] = entity;
      else store.technicians.push(entity);
      return entity;
    }),
  };

  const usersRepo = {
    findOne: jest.fn(async ({ where }: { where: Partial<UserEntity> }) => {
      return (
        store.users.find((u) =>
          Object.entries(where).every(
            ([k, v]) => (u as unknown as Record<string, unknown>)[k] === v,
          ),
        ) ?? null
      );
    }),
  };

  const manager = {
    create: jest.fn((entity: unknown, data: unknown) => {
      if (entity === TechnicianEntity) {
        return {
          id: `tech-${store.technicians.length + 1}`,
          created_at: new Date(),
          updated_at: new Date(),
          ...(data as object),
        } as TechnicianEntity;
      }
      if (entity === UserEntity) {
        return {
          id: `user-${store.users.length + 1}`,
          created_at: new Date(),
          updated_at: new Date(),
          ...(data as object),
        } as UserEntity;
      }
      return { ...(data as object) };
    }),
    save: jest.fn(async (entity: unknown) => {
      const e = entity as { id: string } & Record<string, unknown>;
      if ('full_name' in e && 'vendor_id' in e && !('role' in e)) {
        const idx = store.technicians.findIndex((t) => t.id === e.id);
        if (idx >= 0) store.technicians[idx] = entity as TechnicianEntity;
        else store.technicians.push(entity as TechnicianEntity);
      } else if ('password_hash' in e || 'role' in e) {
        const idx = store.users.findIndex((u) => u.id === e.id);
        if (idx >= 0) store.users[idx] = entity as UserEntity;
        else store.users.push(entity as UserEntity);
      }
      return entity;
    }),
    findOne: jest.fn(
      async (entity: unknown, opts: { where: Record<string, unknown> }) => {
        if (entity === UserEntity) {
          return (
            store.users.find((u) =>
              Object.entries(opts.where).every(
                ([k, v]) => (u as unknown as Record<string, unknown>)[k] === v,
              ),
            ) ?? null
          );
        }
        return null;
      },
    ),
    delete: jest.fn(
      async (entity: unknown, criteria: Record<string, unknown>) => {
        if (entity === UserEntity) {
          store.users = store.users.filter(
            (u) =>
              !Object.entries(criteria).every(
                ([k, v]) => (u as unknown as Record<string, unknown>)[k] === v,
              ),
          );
        }
        if (entity === TechnicianEntity) {
          store.technicians = store.technicians.filter(
            (t) =>
              !Object.entries(criteria).every(
                ([k, v]) => (t as unknown as Record<string, unknown>)[k] === v,
              ),
          );
        }
        return { affected: 1 };
      },
    ),
  };

  const dataSource = {
    transaction: async <T>(cb: (m: unknown) => Promise<T>): Promise<T> =>
      cb(manager),
  };

  const service = new TechniciansService(
    techRepo as never,
    usersRepo as never,
    dataSource as never,
  );

  return { service, store, techRepo, usersRepo };
}

const BASE_DTO = {
  full_name: 'New Tech',
  phone: '+911111111111',
  email: 'new@tech.com',
  password: 'password123',
  skills: ['ac'],
  status: TechnicianStatus.ACTIVE,
};

describe('TechniciansService.create', () => {
  it('throws Forbidden if vendor_id is missing', async () => {
    const { service } = makeService();
    await expect(service.create('', BASE_DTO)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws Conflict if the email is already taken', async () => {
    const { service } = makeService({
      users: [
        {
          id: 'u-1',
          email: 'new@tech.com',
          password_hash: 'x',
          name: 'Existing',
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        } as UserEntity,
      ],
    });
    await expect(service.create('v-1', BASE_DTO)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates technician and linked user in a transaction', async () => {
    const { service, store } = makeService();
    const result = await service.create('v-1', BASE_DTO);
    expect(result.vendor_id).toBe('v-1');
    expect(result.email).toBe('new@tech.com');
    expect(store.technicians).toHaveLength(1);
    expect(store.users).toHaveLength(1);
    const user = store.users[0];
    expect(user.role).toBe(Role.TECHNICIAN);
    expect(user.vendor_id).toBe('v-1');
    expect(user.technician_id).toBe(store.technicians[0].id);
    expect(user.password_hash).toBe('hashed-password');
  });
});

describe('TechniciansService.findOneForVendor', () => {
  it('returns the technician when owned by the vendor', async () => {
    const tech = {
      id: 't-1',
      vendor_id: 'v-1',
      full_name: 'A',
      phone: '1',
      email: 'a@a.com',
      skills: [],
      status: TechnicianStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    } as TechnicianEntity;
    const { service } = makeService({ technicians: [tech] });
    const result = await service.findOneForVendor('v-1', 't-1');
    expect(result.id).toBe('t-1');
  });

  it('404s when not owned by vendor', async () => {
    const tech = {
      id: 't-1',
      vendor_id: 'v-other',
      full_name: 'A',
      phone: '1',
      email: 'a@a.com',
      skills: [],
      status: TechnicianStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    } as TechnicianEntity;
    const { service } = makeService({ technicians: [tech] });
    await expect(
      service.findOneForVendor('v-1', 't-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('404s when id does not exist', async () => {
    const { service } = makeService();
    await expect(
      service.findOneForVendor('v-1', 't-missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('TechniciansService.remove', () => {
  it('removes technician and linked user in a transaction', async () => {
    const { service, store } = makeService({
      technicians: [
        {
          id: 't-1',
          vendor_id: 'v-1',
          full_name: 'A',
          phone: '1',
          email: 'a@a.com',
          skills: [],
          status: TechnicianStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        } as TechnicianEntity,
      ],
      users: [
        {
          id: 'u-1',
          email: 'a@a.com',
          password_hash: 'x',
          name: 'A',
          role: Role.TECHNICIAN,
          status: UserStatus.ACTIVE,
          technician_id: 't-1',
          vendor_id: 'v-1',
          created_at: new Date(),
          updated_at: new Date(),
        } as UserEntity,
      ],
    });
    await service.remove('v-1', 't-1');
    expect(store.technicians).toHaveLength(0);
    expect(store.users).toHaveLength(0);
  });

  it('refuses to remove a technician owned by a different vendor', async () => {
    const { service } = makeService({
      technicians: [
        {
          id: 't-1',
          vendor_id: 'v-other',
          full_name: 'A',
          phone: '1',
          email: 'a@a.com',
          skills: [],
          status: TechnicianStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        } as TechnicianEntity,
      ],
    });
    await expect(service.remove('v-1', 't-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
