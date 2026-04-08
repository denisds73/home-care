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

export enum TechnicianStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Entity('technicians')
export class TechnicianEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  vendor_id!: string;

  @ManyToOne(() => VendorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: VendorEntity;

  @Column({ length: 120 })
  full_name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 120, unique: true })
  email!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  skills!: string[];

  @Column({
    type: 'enum',
    enum: TechnicianStatus,
    default: TechnicianStatus.ACTIVE,
  })
  status!: TechnicianStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
