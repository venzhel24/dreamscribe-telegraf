import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from '../types/tgbot.context';
import {
  BUTTON_TEXTS,
  SCENE_START_TEXTS,
  TEMP_MESSAGES,
} from '../constants/texts';
import { BaseScene } from './base.scene';

@Scene('start')
export class StartScene extends BaseScene {
  private readonly buttonActions = {
    write_story: BUTTON_TEXTS.write_story,
    show_stories: BUTTON_TEXTS.show_stories,
    stories_feed: BUTTON_TEXTS.stories_feed,
  };

  private readonly callbackHandlers = {
    write_story: async (ctx: Context) => {
      await ctx.answerCbQuery();
      await ctx.scene.enter('write_story');
    },
    show_stories: async (ctx: Context) => {
      await ctx.answerCbQuery();
      await ctx.scene.enter('show_stories');
    },
    stories_feed: async (ctx: Context) => {
      await ctx.answerCbQuery();
      await ctx.scene.enter('stories_feed');
    },
  };

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const handler = this.callbackHandlers[query.data];
    if (handler) {
      await handler(ctx);
    } else {
      await ctx.answerCbQuery('Команда не найдена.');
    }
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    const additionalMessage = state?.message ? `${state.message}\n\n` : '';
    const fullText = `${additionalMessage}${SCENE_START_TEXTS.greeting}`;

    await this.sendMessageOrEdit(
      ctx,
      fullText,
      this.getInlineKeyboard(this.buttonActions),
    );
  }
}
