import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Admin (e2e)', () => {
  let app: INestApplication;

  const adminUser = {
    name: 'Admin E2E User',
    email: `e2e-admin-${Date.now()}@test.com`,
    password: 'TestPass123!',
    phone: '9000000010',
    role: 'admin',
  };

  const customerUser = {
    name: 'Customer E2E User',
    email: `e2e-admin-cust-${Date.now()}@test.com`,
    password: 'TestPass123!',
    phone: '9000000011',
    role: 'customer',
  };

  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let createdServiceId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();

    // Sign up admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(adminUser)
      .expect(201);

    adminToken = adminRes.body.data.token;

    // Sign up customer
    const customerRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(customerUser)
      .expect(201);

    customerToken = customerRes.body.data.token;
    customerId = customerRes.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Dashboard Stats ────────────────────────────────────────────

  describe('GET /api/admin/stats', () => {
    it('should return dashboard stats for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data).toBe('object');
    });

    it('should fail without admin role (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/stats')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── Bookings ───────────────────────────────────────────────────

  describe('GET /api/admin/bookings', () => {
    it('should return an array of bookings', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── Services CRUD ──────────────────────────────────────────────

  describe('POST /api/admin/services', () => {
    it('should create a new service', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: 'Cleaning',
          service_name: 'E2E Test Service',
          description: 'A service created by e2e tests',
          price: 299.99,
          is_basic: false,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.service_name).toBe('E2E Test Service');
      expect(res.body.data.price).toBe(299.99);

      createdServiceId = res.body.data.id;
    });

    it('should fail with invalid payload (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ category: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('PUT /api/admin/services/:id', () => {
    it('should update the created service', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          service_name: 'E2E Updated Service',
          price: 349.99,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.service_name).toBe('E2E Updated Service');
      expect(res.body.data.price).toBe(349.99);
    });
  });

  describe('DELETE /api/admin/services/:id', () => {
    it('should soft-delete the created service', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/admin/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ─── Users ──────────────────────────────────────────────────────

  describe('GET /api/admin/users', () => {
    it('should return an array of users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should support filtering by role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?role=customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH /api/admin/users/:id/status', () => {
    it('should suspend a user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/users/${customerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail with invalid UUID (400)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/admin/users/not-a-uuid/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  // ─── Partners ───────────────────────────────────────────────────

  describe('GET /api/admin/partners', () => {
    it('should return an array of partners', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── Finance ────────────────────────────────────────────────────

  describe('GET /api/admin/finance', () => {
    it('should return a finance summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/finance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data).toBe('object');
    });
  });
});
