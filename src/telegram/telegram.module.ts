import { Logger, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramConfigService } from '../config/telegram.config.service';
import { StoryModule } from '../story/story.module';
import { RatingModule } from '../rating/rating.module';
import { StartScene } from './scenes/start.scene';
import { WriteStoryScene } from './scenes/write-story.scene';
import { ShowStoriesScene } from './scenes/show-stories.scene';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useClass: TelegramConfigService,
      inject: [TelegramConfigService],
    }),
    StoryModule,
    RatingModule,
  ],
  providers: [
    TelegramService,
    Logger,
    StartScene,
    WriteStoryScene,
    ShowStoriesScene,
  ],
})
export class TelegramModule {}
