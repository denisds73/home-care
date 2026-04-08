import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from '@/config/env.validation';
import { databaseConfig } from '@/config/database.config';
import { jwtConfig } from '@/config/jwt.config';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { ServicesModule } from '@/modules/services/services.module';
import { BookingsModule } from '@/modules/bookings/bookings.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { VendorsModule } from '@/modules/vendors/vendors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'homecare'),
        password: config.get<string>('database.password', 'homecare_dev'),
        database: config.get<string>('database.database', 'homecare_dev'),
        entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    VendorsModule,
  ],
})
export class AppModule {}
