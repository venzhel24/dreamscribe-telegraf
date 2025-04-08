import { Ctx, Scene, SceneEnter, On } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/services/story.service';
import { SCENE_STORIES_FEED_TEXTS, BUTTON_TEXTS } from '../constants/texts';
import { BaseScene } from './base.scene';
import { RatingService } from '../../story/services/rating.service';

@Scene('stories_feed')
@UseFilters(TelegrafExceptionFilter)
export class StoriesFeedScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
    private readonly ratingService: RatingService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    await this.showRandomStory(ctx);
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const [action, value] = query.data.split(':');
    switch (action) {
      case 'rate':
        await this.handleRating(ctx, value === 'like');
        break;
      case 'next':
        await ctx.answerCbQuery();
        await this.showRandomStory(ctx);
        break;
      case 'back':
        await ctx.answerCbQuery();
        await ctx.scene.enter('start');
        break;
      default:
        await ctx.answerCbQuery('Неизвестная команда.');
    }
  }

  private async showRandomStory(ctx: Context) {
    const state = this.getState(ctx);
    const userId = ctx.from.id;

    const randomStory = await this.storyService.findRandomUnratedStory(userId);

    if (!randomStory) {
      await ctx.scene.enter('start', {
        message: SCENE_STORIES_FEED_TEXTS.noMoreStories,
      });
      return;
    }

    state.storyId = randomStory.id;
    ctx.scene.state = state;

    const text =
      `*${SCENE_STORIES_FEED_TEXTS.title}:* ${randomStory.title}\n` +
      `_${randomStory.content}_`;

    await this.sendMessageOrEdit(ctx, text, this.getRatingKeyboard());
  }

  private async handleRating(ctx: Context, isLike: boolean) {
    const state = this.getState(ctx);

    const userId = ctx.from.id;
    const storyId = state.storyId;

    if (!storyId) {
      await ctx.reply(SCENE_STORIES_FEED_TEXTS.error, this.getBackButton());
      return;
    }

    await this.ratingService.addRating(storyId, userId, isLike);
    await ctx.scene.enter('stories_feed');
  }

  private getRatingKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.like, 'rate:like')],
      [Markup.button.callback(BUTTON_TEXTS.dislike, 'rate:dislike')],
      [Markup.button.callback(BUTTON_TEXTS.backToMenu, 'back')],
    ]);
  }

  private getBackButton() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.backToMenu, 'back')],
    ]);
  }
}
