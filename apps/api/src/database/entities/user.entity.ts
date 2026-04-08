import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VendorEntity } from './vendor.entity';
import { TechnicianEntity } from './technician.entity';

export enum Role {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role!: Role;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

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

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
