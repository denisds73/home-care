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

export enum DelayType {
  RUNNING_LATE = 'running_late',
  CANNOT_ATTEND = 'cannot_attend',
}

export enum DelayReason {
  TRAFFIC = 'traffic',
  PREVIOUS_JOB_OVERRAN = 'previous_job_overran',
  VEHICLE_ISSUE = 'vehicle_issue',
  PERSONAL_EMERGENCY = 'personal_emergency',
  SICK = 'sick',
  VEHICLE_BREAKDOWN = 'vehicle_breakdown',
  SCHEDULING_CONFLICT = 'scheduling_conflict',
  WEATHER = 'weather',
  PARTS_UNAVAILABLE = 'parts_unavailable',
  OTHER = 'other',
}

export enum ClientDelayResponse {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  RESCHEDULE_REQUESTED = 'reschedule_requested',
  CANCELLED = 'cancelled',
}

@Entity('delay_events')
@Index(['booking_id', 'is_active'])
export class DelayEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  booking_id!: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column({ type: 'enum', enum: DelayType })
  delay_type!: DelayType;

  @Column({ type: 'enum', enum: DelayReason })
  reason!: DelayReason;

  @Column({ type: 'text', nullable: true })
  reason_note?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  revised_eta?: Date | null;

  @Column({ type: 'text' })
  original_eta!: string;

  @Column('uuid')
  reported_by_user_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'reported_by_user_id' })
  reported_by_user?: UserEntity;

  @Column({ type: 'text' })
  reported_by_role!: string;

  @Column({
    type: 'enum',
    enum: ClientDelayResponse,
    nullable: true,
    default: null,
  })
  client_response?: ClientDelayResponse | null;

  @Column({ type: 'timestamptz', nullable: true })
  client_responded_at?: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
