import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Notifications (e2e)', () => {
  let app: INestApplication;

  const testUser = {
    name: 'Notification Test User',
    email: `e2e-notif-${Date.now()}@test.com`,
    password: 'TestPass123!',
    phone: '9000000003',
  };

  let authToken: string;

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

    // Sign up a user and get token
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(testUser)
      .expect(201);

    authToken = signupRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/notifications ──────────────────────────────────────

  describe('GET /api/notifications', () => {
    it('should return an array of notifications (may be empty)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── PATCH /api/notifications/read-all ───────────────────────────

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('message');
    });
  });

  // ─── PATCH /api/notifications/:id/read ───────────────────────────

  describe('PATCH /api/notifications/:id/read', () => {
    it('should fail with an invalid UUID (400)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/not-a-valid-uuid/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/notifications/00000000-0000-0000-0000-000000000000/read')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
