import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let bookingId: string;

  const testUser = {
    name: 'Booking Test User',
    email: `booking-test-${Date.now()}@example.com`,
    password: 'Test@12345',
    phone: '9876543210',
    role: 'customer',
  };

  const bookingPayload = {
    customer_name: 'Test User',
    phone: '9876543210',
    address: '123 Test St',
    lat: 12.9716,
    lng: 77.5946,
    category: 'ac',
    service_name: 'AC Gas Refill',
    price: 499,
    services_list: [
      { id: 1, name: 'AC Gas Refill', price: 499, qty: 1 },
    ],
    preferred_date: '2026-05-01',
    payment_mode: 'PAY_AFTER_SERVICE',
  };

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

    // Sign up a customer and obtain a JWT token
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(testUser)
      .expect(201);

    token = signupRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.booking_id).toBeDefined();
      expect(res.body.data.customer_name).toBe(bookingPayload.customer_name);
      expect(res.body.data.category).toBe(bookingPayload.category);
      expect(res.body.data.service_name).toBe(bookingPayload.service_name);
      expect(res.body.data.booking_status).toBe('Pending');

      bookingId = res.body.data.booking_id;
    });

    it('should fail without auth (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/bookings')
        .send(bookingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/me', () => {
    it('should return an array including the created booking', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/bookings/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.find(
        (b: Record<string, unknown>) => b.booking_id === bookingId,
      );
      expect(found).toBeDefined();
      expect(found.service_name).toBe(bookingPayload.service_name);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return the specific booking by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.booking_id).toBe(bookingId);
      expect(res.body.data.customer_name).toBe(bookingPayload.customer_name);
    });
  });

  describe('POST /api/bookings/:id/cancel', () => {
    it('should cancel a Pending booking successfully', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.booking_status).toBe('Cancelled');
    });

    it('should fail to cancel an already cancelled booking (400)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });
});
