import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Wallet (e2e)', () => {
  let app: INestApplication;

  const customerUser = {
    name: 'Wallet Test Customer',
    email: `e2e-wallet-${Date.now()}@test.com`,
    password: 'TestPass123!',
    phone: '9000000002',
    role: 'customer',
  };

  let customerToken: string;

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

    // Sign up a customer and get token
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(customerUser)
      .expect(201);

    customerToken = signupRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/wallet/balance ─────────────────────────────────────

  describe('GET /api/wallet/balance', () => {
    it('should return the wallet balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('balance');
      expect(typeof res.body.data.balance).toBe('number');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wallet/balance')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ─── GET /api/wallet/transactions ────────────────────────────────

  describe('GET /api/wallet/transactions', () => {
    it('should return an array of transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wallet/transactions')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wallet/transactions?page=1&limit=5')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── POST /api/wallet/payouts ────────────────────────────────────

  describe('POST /api/wallet/payouts', () => {
    it('should fail for a non-partner user (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/wallet/payouts')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 100 })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/wallet/payouts')
        .send({ amount: 100 })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
