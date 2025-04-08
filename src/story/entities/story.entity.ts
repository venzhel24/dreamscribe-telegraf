import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Rating } from './rating.entity';

@Entity()
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  telegramId: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 'private' })
  accessModifier: 'public' | 'private';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Rating, (rating) => rating.story)
  ratings: Rating[];
}
