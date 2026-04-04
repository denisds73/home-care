import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryColumn({ length: 50 })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  icon!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 50 })
  color!: string;
}
