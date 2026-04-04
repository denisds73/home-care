import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Categories (e2e)', () => {
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

  describe('GET /api/categories', () => {
    it('should return an array of categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('each category should have id, name, icon, desc, and color', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      // Only validate shape if seed data exists
      if (res.body.data.length > 0) {
        for (const category of res.body.data) {
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('icon');
          expect(category).toHaveProperty('desc');
          expect(category).toHaveProperty('color');

          expect(typeof category.id).toBe('string');
          expect(typeof category.name).toBe('string');
          expect(typeof category.icon).toBe('string');
          expect(typeof category.desc).toBe('string');
          expect(typeof category.color).toBe('string');
        }
      } else {
        // If no seed data, just confirm the array is empty — test passes
        expect(res.body.data).toEqual([]);
      }
    });
  });
});
