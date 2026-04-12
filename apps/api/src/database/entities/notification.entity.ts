import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum NotificationType {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  VENDOR = 'vendor',
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  /** When set, admin UI can deep-link to this booking. */
  @Column({ type: 'uuid', nullable: true })
  booking_id?: string | null;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;
}
