import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Start, Update, On } from 'nestjs-telegraf';
import { Context } from './types/tgbot.context';
import { StoryService } from '../story/services/story.service';

@Injectable()
@Update()
export class TelegramService {
  constructor(
    private readonly logger: Logger,
    private readonly storyService: StoryService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.logger.log(`User ${ctx.from.id} started bot`);
    ctx.scene.state = {};
    await ctx.scene.enter('start');
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const userId = ctx.from.id;
    this.logger.log(`User ${userId} pressed callback: ${query.data}`);

    switch (query.data) {
      case 'edit_transcript':
        await ctx.answerCbQuery();
        this.logger.log(`User ${userId} navigating to edit_transcript scene`);
        const state = ctx.scene.state || {};
        const message = ctx.callbackQuery?.message;
        const transcriptText = (message && 'text' in message) ? message.text?.split('\n').slice(1).join('\n') || '' : '';
        await ctx.scene.enter('edit_transcript', {
          ...state,
          message: transcriptText,
          canEditMessage: true,
        });
        break;

      case 'rewrite_transcript':
        await ctx.answerCbQuery();
        this.logger.log(`User ${userId} navigating to write_story scene for rewrite`);
        await ctx.scene.enter('write_story', {
          canEditMessage: true,
        });
        break;

      case 'confirm_transcript':
        await ctx.answerCbQuery();
        this.logger.log(`User ${userId} confirming transcript`);
        
        try {
          const message = ctx.callbackQuery?.message;
          const transcriptText = (message && 'text' in message) ? message.text?.split('\n').slice(1).join('\n') || '' : '';
          const title = transcriptText.length > 20 ? `${transcriptText.slice(0, 20)}...` : transcriptText;
          
          await this.storyService.create({
            telegramId: userId,
            title,
            content: transcriptText,
            accessModifier: 'private',
          });

          this.logger.log(`Story confirmed and created for user ${userId}`);

          await ctx.scene.enter('start', {
            message: 'История успешно сохранена!',
          });
        } catch (error) {
          this.logger.error(`Error confirming transcript for user ${userId}:`, error);
          await ctx.reply('Произошла ошибка при сохранении истории. Попробуйте снова.');
        }
        break;

      default:
        this.logger.warn(`Unknown callback data: ${query.data} from user ${userId}`);
        break;
    }
  }
}
