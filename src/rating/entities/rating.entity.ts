import { Story } from 'src/story/entities/story.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  telegramId: number;

  @ManyToOne(() => Story, (story) => story.ratings)
  story: Story;

  @Column({ type: 'int', default: 1 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;
}
