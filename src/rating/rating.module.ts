import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { RatingService } from './rating.service';
import { StoryModule } from '../story/story.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rating]), StoryModule],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}