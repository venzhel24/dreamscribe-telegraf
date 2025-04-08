import { Logger, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramConfigService } from '../config/telegram.config.service';
import { StoryModule } from '../story/story.module';
import { StartScene } from './scenes/start.scene';
import { WriteStoryScene } from './scenes/write-story.scene';
import { ShowStoriesScene } from './scenes/show-stories.scene';
import { EditStoryScene } from './scenes/edit-story.scene';
import { ViewStoryScene } from './scenes/view-story.scene';
import { StoriesFeedScene } from './scenes/stories-feed.scene';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useClass: TelegramConfigService,
      inject: [TelegramConfigService],
    }),
    StoryModule,
  ],
  providers: [
    TelegramService,
    Logger,
    StartScene,
    WriteStoryScene,
    ShowStoriesScene,
    EditStoryScene,
    ViewStoryScene,
    StoriesFeedScene,
  ],
})
export class TelegramModule {}
