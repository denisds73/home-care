import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationType, NotificationPriority } from '@/database/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
  ) {}

  async findByUser(userId: string): Promise<NotificationEntity[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
    });
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    }

    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, read: false },
      { read: true },
    );
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    description: string,
    bookingId?: string | null,
    priority?: NotificationPriority,
  ): Promise<NotificationEntity> {
    const notification = this.notificationsRepository.create({
      user_id: userId,
      type,
      title,
      description,
      booking_id: bookingId ?? null,
      priority: priority ?? NotificationPriority.NORMAL,
    });
    return this.notificationsRepository.save(notification);
  }
}
