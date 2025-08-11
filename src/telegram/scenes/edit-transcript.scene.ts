import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/services/story.service';
import { BaseScene } from './base.scene';
import { Logger } from '@nestjs/common';

@Scene('edit_transcript')
export class EditTranscriptScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    this.logger.log(`User ${ctx.from.id} entered edit_transcript scene`);

    try {
      if (state?.canEditMessage && ctx.callbackQuery?.message?.message_id) {
        await ctx.editMessageText(
          `Текущий текст:\n${state.message}\n\nОтправьте исправленный текст:`,
          this.getCancelButton(),
        );
      } else {
        await ctx.reply(
          `Текущий текст:\n${state?.message || ''}\n\nОтправьте исправленный текст:`,
          this.getCancelButton(),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error entering edit_transcript scene for user ${ctx.from.id}:`,
        error,
      );
      await ctx.reply('Отправьте исправленный текст:', this.getCancelButton());
    }
  }

  @On('text')
  async onTextMessage(@Ctx() ctx: Context, @Message('text') msg: string) {
    this.logger.log(`User ${ctx.from.id} edited transcript text`);

    const title = msg.length > 20 ? `${msg.slice(0, 20)}...` : msg;
    const telegramId = ctx.from.id;

    try {
      await this.storyService.create({
        telegramId,
        title,
        content: msg,
        accessModifier: 'private',
      });

      this.logger.log(`Story created successfully for user ${telegramId}`);

      await ctx.scene.enter('start', {
        message: 'История успешно сохранена!',
      });
    } catch (error) {
      this.logger.error(`Error creating story for user ${telegramId}:`, error);
      await ctx.reply(
        'Произошла ошибка при сохранении истории. Попробуйте снова.',
      );
    }
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() context: Context) {
    const query = context.callbackQuery;
    if (!(query && 'data' in query)) return;

    if (query.data === 'cancel') {
      this.logger.log(`User ${context.from.id} cancelled edit_transcript`);
      await context.answerCbQuery();
      await context.scene.enter('start', {
        message: 'Редактирование отменено',
      });
    }
  }
}
