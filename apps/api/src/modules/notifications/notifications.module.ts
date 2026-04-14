import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/database/entities';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationsService } from './notifications.service';
import { NotificationSseService } from './notification-sse.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    AuthModule, // provides JwtModule for SSE token validation
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationSseService],
  exports: [NotificationsService, NotificationSseService],
})
export class NotificationsModule {}
