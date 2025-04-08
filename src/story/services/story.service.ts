import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Story } from '../entities/story.entity';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(data: Partial<Story>) {
    const story = this.storyRepository.create(data);
    return this.storyRepository.save(story);
  }

  async findUserStories(telegramId: number, skip: number, take: number) {
    return this.storyRepository.find({
      where: { telegramId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async countUserStories(telegramId: number) {
    return this.storyRepository.count({ where: { telegramId } });
  }

  async searchStories(
    telegramId: number,
    query: string,
    skip: number,
    take: number,
  ) {
    return this.storyRepository.find({
      where: [
        { telegramId, title: ILike(`%${query}%`) },
        { telegramId, content: ILike(`%${query}%`) },
      ],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async countSearchResults(telegramId: number, query: string) {
    return this.storyRepository.count({
      where: [
        { telegramId, title: ILike(`%${query}%`) },
        { telegramId, content: ILike(`%${query}%`) },
      ],
    });
  }

  async update(id: number, data: Partial<Story>) {
    return this.storyRepository.update(id, data);
  }

  async findOne(id: number) {
    return this.storyRepository.findOneBy({ id });
  }

  async findRandomUnratedStory(userId: number) {
    const ratedStoryIds = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('story.id', 'storyId')
      .leftJoin('rating.story', 'story')
      .where('rating.telegramId = :userId', { userId })
      .getRawMany();

    const viewedStoryIds = ratedStoryIds.map((item) => item.storyId);

    const queryBuilder = this.storyRepository
      .createQueryBuilder('story')
      .where('story.accessModifier = :accessModifier', {
        accessModifier: 'public',
      })
      .andWhere('story.telegramId != :userId', { userId });

    if (viewedStoryIds.length > 0) {
      queryBuilder.andWhere('story.id NOT IN (:...viewedStoryIds)', {
        viewedStoryIds,
      });
    }

    return queryBuilder.orderBy('RANDOM()').getOne();
  }
}
