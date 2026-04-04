import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Services (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/services', () => {
    it('should return an array of services', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter services by category query param', async () => {
      // First, get all services to find a valid category
      const allRes = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      if (allRes.body.data.length === 0) {
        // No seed data — skip meaningful filter assertion
        return;
      }

      const category = allRes.body.data[0].category;

      const res = await request(app.getHttpServer())
        .get(`/api/services?category=${category}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Every returned service should match the requested category
      for (const service of res.body.data) {
        expect(service.category).toBe(category);
      }
    });
  });

  describe('GET /api/services/search', () => {
    it('should return matching services for a search query', async () => {
      // First get a service name to search for
      const allRes = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      if (allRes.body.data.length === 0) {
        return;
      }

      // Use a substring from the first service name as the search term
      const firstServiceName: string = allRes.body.data[0].service_name;
      const searchTerm = firstServiceName.substring(0, 4);

      const res = await request(app.getHttpServer())
        .get(`/api/services/search?q=${encodeURIComponent(searchTerm)}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return a single service by ID', async () => {
      // First get a valid service ID
      const allRes = await request(app.getHttpServer())
        .get('/api/services')
        .expect(200);

      if (allRes.body.data.length === 0) {
        return;
      }

      const serviceId = allRes.body.data[0].id;

      const res = await request(app.getHttpServer())
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', serviceId);
      expect(res.body.data).toHaveProperty('service_name');
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('price');
      expect(res.body.data).toHaveProperty('category');
    });

    it('should return 404 for a non-existent service ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/services/999999')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
