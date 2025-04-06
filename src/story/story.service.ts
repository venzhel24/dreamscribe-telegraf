import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Story } from './entities/story.entity';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
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
}
