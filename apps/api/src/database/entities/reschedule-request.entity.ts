import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

export enum RescheduleStatus {
  PROPOSED = 'proposed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTER_PROPOSED = 'counter_proposed',
  EXPIRED = 'expired',
  AUTO_CONFIRMED = 'auto_confirmed',
}

export enum RescheduleInitiator {
  CLIENT = 'client',
  VENDOR = 'vendor',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

@Entity('reschedule_requests')
@Index(['booking_id', 'status'])
export class RescheduleRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  booking_id!: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column('uuid')
  initiated_by_user_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'initiated_by_user_id' })
  initiated_by_user?: UserEntity;

  @Column({ type: 'enum', enum: RescheduleInitiator })
  initiated_by_role!: RescheduleInitiator;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  reason_note?: string | null;

  @Column({ type: 'date' })
  original_date!: string;

  @Column({ length: 20 })
  original_time_slot!: string;

  @Column({ type: 'date' })
  proposed_date!: string;

  @Column({ length: 20 })
  proposed_time_slot!: string;

  @Column({ type: 'enum', enum: RescheduleStatus, default: RescheduleStatus.PROPOSED })
  status!: RescheduleStatus;

  @Column({ type: 'uuid', nullable: true })
  responded_by_user_id?: string | null;

  @Column({ type: 'text', nullable: true })
  responded_by_role?: string | null;

  @Column({ type: 'date', nullable: true })
  counter_date?: string | null;

  @Column({ length: 20, nullable: true })
  counter_time_slot?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date | null;

  @Column({ type: 'int', default: 1 })
  reschedule_number!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
