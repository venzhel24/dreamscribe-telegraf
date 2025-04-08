import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/services/story.service';
import { SCENE_WRITE_STORY_TEXTS } from '../constants/texts';
import { BaseScene } from './base.scene';
import { Logger } from '@nestjs/common';

@Scene('write_story')
export class WriteStoryScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
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
