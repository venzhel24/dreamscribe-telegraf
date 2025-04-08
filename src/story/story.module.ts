import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';
import { StoryService } from './services/story.service';
import { Rating } from './entities/rating.entity';
import { RatingService } from './services/rating.service';

@Module({
  imports: [TypeOrmModule.forFeature([Story, Rating])],
  providers: [StoryService, RatingService],
  exports: [StoryService, RatingService],
})
export class StoryModule {}
