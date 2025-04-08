import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from '../entities/story.entity';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async addRating(storyId: number, userId: number, isLike: boolean) {
    const story = await this.storyRepository.findOneBy({ id: storyId });

    if (!story) {
      throw new Error('История не найдена');
    }

    await this.ratingRepository.save({
      story: story,
      telegramId: userId,
      isLike: isLike,
    });

    await this.storyRepository.save(story);
  }
}
