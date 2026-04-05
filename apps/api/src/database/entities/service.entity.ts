import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity('services')
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  category!: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category', referencedColumnName: 'id' })
  categoryEntity?: CategoryEntity;

  @Column({ length: 100 })
  service_name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ default: false })
  is_basic!: boolean;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'text', nullable: true })
  long_description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  original_price?: number;

  @Column({ length: 500, nullable: true })
  image_url?: string;

  @Column({ length: 50, nullable: true })
  estimated_duration?: string;

  @Column({ type: 'jsonb', default: '[]' })
  inclusions!: string[];

  @Column({ type: 'jsonb', default: '[]' })
  exclusions!: string[];

  @Column({ type: 'jsonb', default: '[]' })
  faqs!: Array<{ question: string; answer: string }>;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating_average!: number;

  @Column({ default: 0 })
  rating_count!: number;

  @Column({ type: 'jsonb', default: '[0,0,0,0,0]' })
  rating_distribution!: number[];

  @Column({ default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
