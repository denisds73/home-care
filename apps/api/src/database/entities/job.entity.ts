import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BookingEntity } from './booking.entity';

export enum JobStatus {
  NEW = 'new',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
}

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  booking_id!: string;

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column('uuid')
  partner_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'partner_id' })
  partner?: UserEntity;

  @Column({ length: 100 })
  customer_name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ length: 50 })
  category!: string;

  @Column({ length: 100 })
  service_name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'date' })
  preferred_date!: string;

  @Column({ length: 20 })
  time_slot!: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.NEW })
  status!: JobStatus;

  @CreateDateColumn()
  created_at!: Date;
}
