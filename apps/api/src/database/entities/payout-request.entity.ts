import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PartnerEntity } from './partner.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}

@Entity('payout_requests')
export class PayoutRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  partner_id!: string;

  @ManyToOne(() => PartnerEntity)
  @JoinColumn({ name: 'partner_id' })
  partner?: PartnerEntity;

  @Column({ length: 100 })
  partner_name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status!: PayoutStatus;

  @CreateDateColumn()
  requested_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  processed_at?: Date;
}
