import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

@Entity('booking_status_events')
@Index(['booking_id', 'created_at'])
export class BookingStatusEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  booking_id!: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column({ type: 'text', nullable: true })
  from_status?: string | null;

  @Column({ type: 'text' })
  to_status!: string;

  @Column({ type: 'text' })
  event!: string;

  @Column('uuid')
  actor_user_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'actor_user_id' })
  actor?: UserEntity;

  @Column({ type: 'text' })
  actor_role!: string;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
