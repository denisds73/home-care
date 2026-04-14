import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import { ResponseEnvelopeInterceptor } from '@/common/interceptors/response-envelope.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** In development, allow Vite from private LAN (same Wi‑Fi phone testing). */
function isDevLanViteOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (u.port !== '5173') return false;
    const h = u.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return true;
    if (/^192\.168\./.test(h)) return true;
    if (/^10\./.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
    return false;
  } catch {
    return false;
  }
}

function buildCorsOptions(): CorsOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const explicit = parseCorsOrigins();

  if (isProd) {
    return {
      origin: explicit.length === 1 ? explicit[0] : explicit,
      credentials: true,
    };
  }

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (explicit.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, isDevLanViteOrigin(origin));
    },
    credentials: true,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(prefix);

  app.enableCors(buildCorsOptions());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HomeCare API')
    .setDescription('Home Services Marketplace API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`HomeCare API running on http://localhost:${port}/${prefix}`);
  console.log(`Swagger docs at http://localhost:${port}/${prefix}/docs`);
  if (host === '0.0.0.0') {
    console.log(
      `LAN access: use http://<this-machine-ip>:${port}/${prefix} from other devices on the same Wi‑Fi`,
    );
  }
}

bootstrap();
