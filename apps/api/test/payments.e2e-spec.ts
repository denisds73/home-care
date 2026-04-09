import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Payments (e2e)', () => {
  let app: INestApplication;

  const customerUser = {
    name: 'Payment Test Customer',
    email: `e2e-pay-${Date.now()}@test.com`,
    password: 'TestPass123!',
    phone: '9000000001',
    role: 'customer',
  };

  let customerToken: string;
  let bookingId: string;

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

    // Create a booking so we have a valid receipt reference
    const bookingRes = await request(app.getHttpServer())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customer_name: customerUser.name,
        phone: customerUser.phone,
        address: '123 Test Street',
        lat: 28.6139,
        lng: 77.209,
        category: 'Cleaning',
        service_name: 'Deep Cleaning',
        price: 499,
        services_list: [
          { id: 1, name: 'Deep Cleaning', price: 499, qty: 1 },
        ],
        preferred_date: '2026-05-01',
        payment_mode: 'PAY_NOW',
      })
      .expect(201);

    bookingId = bookingRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /api/payments/order ────────────────────────────────────

  describe('POST /api/payments/order', () => {
    it('should create a payment order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: 49900,
          currency: 'INR',
          receipt: `booking_${bookingId}`,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('order_id');
      expect(res.body.data).toHaveProperty('amount');
      expect(res.body.data).toHaveProperty('currency');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/order')
        .send({
          amount: 49900,
          currency: 'INR',
          receipt: 'booking_no_auth',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should fail with invalid payload (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: -1, currency: '', receipt: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  // ─── POST /api/payments/verify ───────────────────────────────────

  describe('POST /api/payments/verify', () => {
    it('should verify a payment in mock mode', async () => {
      // First create an order to get a valid order_id
      const orderRes = await request(app.getHttpServer())
        .post('/api/payments/order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: 49900,
          currency: 'INR',
          receipt: `booking_${bookingId}_verify`,
        })
        .expect(201);

      const orderId = orderRes.body.data.order_id;

      const res = await request(app.getHttpServer())
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_mock_123',
          razorpay_signature: 'mock_signature_value',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transaction_id');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/verify')
        .send({
          razorpay_order_id: 'order_fake',
          razorpay_payment_id: 'pay_fake',
          razorpay_signature: 'sig_fake',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
