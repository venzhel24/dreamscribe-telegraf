import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { BUTTON_TEXTS } from '../constants/texts';
import { SceneState } from '../types/scene-state.interface';

@UseFilters(TelegrafExceptionFilter)
export abstract class BaseScene {
  constructor(protected readonly logger: Logger) {}

  protected async sendMessageOrEdit(
    ctx: Context,
    text: string,
    keyboard?: any,
  ) {
    const state = this.getState(ctx);

    if (state.canEditMessage && ctx.callbackQuery?.message?.message_id) {
      try {
        await ctx.editMessageText(text, keyboard);
      } catch (error) {
        this.logger.error('Ошибка при редактировании сообщения:', error);
        await ctx.reply(text, keyboard);
      }
    } else {
      await ctx.reply(text, keyboard);
    }
  }

  protected getState(ctx: Context): SceneState {
    return ctx.scene.state as SceneState;
  }

  protected getInlineKeyboard(buttons: Record<string, string>) {
    return Markup.inlineKeyboard(
      Object.entries(buttons).map(([action, text]) => [
        Markup.button.callback(text, action),
      ]),
    );
  }

  protected getCancelButton() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.cancel, 'cancel')],
    ]);
  }
}
