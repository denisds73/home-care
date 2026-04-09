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

@Entity('offers')
export class OfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ length: 30 })
  tag!: string;

  @Column({ length: 30, default: 'Book Now' })
  cta_text!: string;

  @Column({ length: 50 })
  category!: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category', referencedColumnName: 'id' })
  categoryEntity?: CategoryEntity;

  @Column({ length: 500, default: '' })
  image_url!: string;

  @Column({ length: 300 })
  bg_gradient!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
