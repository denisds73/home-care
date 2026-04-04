import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-secret',
  expiration: process.env.JWT_EXPIRATION || '7d',
}));
