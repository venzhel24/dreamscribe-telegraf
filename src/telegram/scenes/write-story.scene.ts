import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/services/story.service';
import { SCENE_WRITE_STORY_TEXTS } from '../constants/texts';
import { BaseScene } from './base.scene';
import { Logger } from '@nestjs/common';
import { TranscriptionService } from '../../transcription/services/transcription.service';

@Scene('write_story')
export class WriteStoryScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
    private readonly transcriptionService: TranscriptionService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    try {
      if (state?.canEditMessage && ctx.callbackQuery?.message?.message_id) {
        await ctx.editMessageText(
          SCENE_WRITE_STORY_TEXTS.greeting,
          this.getCancelButton(),
        );
      } else {
        await ctx.reply(
          SCENE_WRITE_STORY_TEXTS.greeting,
          this.getCancelButton(),
        );
      }
    } catch (error) {
      this.logger.error('Ошибка при входе в сцену:', error);
      await ctx.reply(SCENE_WRITE_STORY_TEXTS.greeting, this.getCancelButton());
    }
  }

  @On('text')
  async onTextMessage(@Ctx() ctx: Context, @Message('text') msg: string) {
    const title = msg.length > 20 ? `${msg.slice(0, 20)}...` : msg;

    const telegramId = ctx.from.id;
    await this.storyService.create({
      telegramId,
      title,
      content: msg,
      accessModifier: 'private',
    });

    await ctx.scene.enter('start', {
      message: SCENE_WRITE_STORY_TEXTS.success,
    });
  }

  @On('voice')
  @On('audio')
  async onAudioMessage(@Ctx() ctx: Context) {
    const message = ctx.message as any;
    let audioFileId: string | undefined;

    if ('voice' in message && message.voice) {
      audioFileId = message.voice.file_id;
    } else if ('audio' in message && message.audio) {
      audioFileId = message.audio.file_id;
    } else {
      await ctx.reply('Не удалось найти аудиофайл в сообщении.');
      return;
    }

    const file = await ctx.telegram.getFile(audioFileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    await this.transcriptionService.addTranscriptionJob({
      audioUrl: fileUrl,
      userId: ctx.from.id,
      messageId: ctx.message.message_id,
    });

    await ctx.reply('Сообщение обрабатывается. Подождите...');
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() context: Context) {
    const query = context.callbackQuery;
    if (!(query && 'data' in query)) return;

    if (query.data === 'cancel') {
      await context.answerCbQuery();
      await context.scene.enter('start', {
        message: SCENE_WRITE_STORY_TEXTS.cancelledMessage,
      });
    }
  }
}
