import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum PartnerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
}

@Entity('partners')
export class PartnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  user_id!: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column('text', { array: true, default: '{}' })
  skills!: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ default: 0 })
  completed_jobs!: number;

  @Column({ length: 100, default: '' })
  service_area!: string;

  @Column({ default: false })
  is_online!: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  earnings!: number;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.PENDING })
  status!: PartnerStatus;

  @CreateDateColumn()
  joined_at!: Date;
}
