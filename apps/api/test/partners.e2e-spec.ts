import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';
import { PartnerEntity } from '@/database/entities';

describe('Partners (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let dataSource: DataSource;

  const testPartner = {
    name: 'Partner Test User',
    email: `partner-test-${Date.now()}@example.com`,
    password: 'Test@12345',
    phone: '9876543211',
    role: 'partner',
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

    dataSource = app.get(DataSource);

    // Sign up a partner user and obtain a JWT token
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(testPartner)
      .expect(201);

    token = signupRes.body.data.token;
    const userId: string = signupRes.body.data.user.id;

    // The signup flow does not auto-create a partner profile,
    // so we insert one directly via the repository.
    const partnerRepo = dataSource.getRepository(PartnerEntity);
    await partnerRepo.save(
      partnerRepo.create({
        user_id: userId,
        skills: ['plumbing', 'electrical'],
        service_area: 'Mumbai - Andheri',
        is_online: false,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/partners/me', () => {
    it('should return the partner profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/partners/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const profile = res.body.data;
      expect(profile.id).toBeDefined();
      expect(profile.name).toBe(testPartner.name);
      expect(profile.email).toBe(testPartner.email);
      expect(profile.skills).toEqual(
        expect.arrayContaining(['plumbing', 'electrical']),
      );
      expect(profile.serviceArea).toBe('Mumbai - Andheri');
      expect(profile.isOnline).toBe(false);
      expect(typeof profile.rating).toBe('number');
      expect(typeof profile.completedJobs).toBe('number');
      expect(typeof profile.earnings).toBe('number');
    });
  });

  describe('PATCH /api/partners/me', () => {
    it('should update skills and service_area', async () => {
      const updatePayload = {
        skills: ['plumbing', 'electrical', 'carpentry'],
        service_area: 'Mumbai - Bandra',
      };

      const res = await request(app.getHttpServer())
        .patch('/api/partners/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload)
        .expect(200);

      expect(res.body.success).toBe(true);

      const profile = res.body.data;
      expect(profile.skills).toEqual(
        expect.arrayContaining(['plumbing', 'electrical', 'carpentry']),
      );
      expect(profile.serviceArea).toBe('Mumbai - Bandra');
    });
  });

  describe('PATCH /api/partners/me/availability', () => {
    it('should toggle the partner to online', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/partners/me/availability')
        .set('Authorization', `Bearer ${token}`)
        .send({ is_online: true })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isOnline).toBe(true);
    });

    it('should toggle the partner back to offline', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/partners/me/availability')
        .set('Authorization', `Bearer ${token}`)
        .send({ is_online: false })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isOnline).toBe(false);
    });
  });

  describe('GET /api/partners/me/jobs', () => {
    it('should return a jobs list (may be empty)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/partners/me/jobs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/partners/me/earnings', () => {
    it('should return an earnings summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/partners/me/earnings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const earnings = res.body.data;
      expect(typeof earnings.totalEarnings).toBe('number');
      expect(typeof earnings.completedJobs).toBe('number');
      expect(typeof earnings.averagePerJob).toBe('number');
    });
  });

  describe('GET /api/partners/me/schedule', () => {
    it('should return schedule data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/partners/me/schedule')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
