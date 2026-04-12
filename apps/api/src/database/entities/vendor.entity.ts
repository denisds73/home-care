import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';

export enum VendorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Entity('vendors')
export class VendorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  company_name!: string;

  @Column({ length: 20 })
  contact_number!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  pin_codes!: string[];

  @Column({ unique: true, length: 15 })
  gst_number!: string;

  @Column({ default: false })
  gst_verified!: boolean;

  @ManyToMany(() => CategoryEntity, { eager: true })
  @JoinTable({
    name: 'vendor_categories',
    joinColumn: { name: 'vendor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: CategoryEntity[];

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status!: VendorStatus;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'onboarded_by' })
  onboarded_by?: UserEntity | null;

  @Column({ type: 'uuid', nullable: true })
  onboarded_by_id?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
