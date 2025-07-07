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
import { TranscriptionModule } from '../transcription/transcription.module';
import { TranscriptionResultConsumer } from './processors/transcription-result.consumer';
import { TelegramSenderService } from './services/telegram-sender.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useClass: TelegramConfigService,
      inject: [TelegramConfigService],
    }),
    StoryModule,
    TranscriptionModule,
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
    TranscriptionResultConsumer,
    TelegramSenderService,
  ],
})
export class TelegramModule {}
