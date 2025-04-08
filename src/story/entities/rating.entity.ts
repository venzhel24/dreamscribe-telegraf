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

  @Column({ type: 'boolean', default: false })
  isLike: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
