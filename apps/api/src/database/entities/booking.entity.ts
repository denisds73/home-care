import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { VendorEntity } from './vendor.entity';
import { TechnicianEntity } from './technician.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum PaymentMode {
  PAY_NOW = 'PAY_NOW',
  PAY_AFTER_SERVICE = 'PAY_AFTER_SERVICE',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  booking_id!: string;

  @Column('uuid')
  customer_id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'customer_id' })
  customer?: UserEntity;

  @Column({ length: 100 })
  customer_name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng!: number;

  @Column({ length: 50 })
  category!: string;

  @Column({ nullable: true })
  service_id?: number;

  @Column({ length: 100 })
  service_name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'jsonb', default: '[]' })
  services_list!: Array<{ id: number; name: string; price: number; qty: number }>;

  @Column({ type: 'date' })
  preferred_date!: string;

  @Column({ type: 'enum', enum: PaymentMode })
  payment_mode!: PaymentMode;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status!: PaymentStatus;

  @Column({ nullable: true })
  razorpay_order_id?: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  booking_status!: BookingStatus;

  @Column({ type: 'uuid', nullable: true })
  vendor_id?: string | null;

  @ManyToOne(() => VendorEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: VendorEntity | null;

  @Column({ type: 'uuid', nullable: true })
  technician_id?: string | null;

  @ManyToOne(() => TechnicianEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'technician_id' })
  technician?: TechnicianEntity | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  completion_otp?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completion_otp_expires_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  assigned_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  accepted_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  started_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at?: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
