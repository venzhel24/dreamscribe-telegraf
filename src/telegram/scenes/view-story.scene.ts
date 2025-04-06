import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/story.service';
import { SCENE_VIEW_STORY_TEXTS, BUTTON_TEXTS } from '../constants/texts';
import { BaseScene } from './base.scene';

@Scene('view_story')
@UseFilters(TelegrafExceptionFilter)
export class ViewStoryScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    if (!state.storyId) {
      await this.sendMessageOrEdit(ctx, SCENE_VIEW_STORY_TEXTS.error);
      await ctx.scene.enter('show_stories');
      return;
    }

    try {
      const story = await this.storyService.findOne(state.storyId);

      if (!story) {
        await this.sendMessageOrEdit(ctx, SCENE_VIEW_STORY_TEXTS.storyNotFound);
        await ctx.scene.enter('show_stories');
        return;
      }

      const text =
        `*${SCENE_VIEW_STORY_TEXTS.title}:* ${story.title}\n` +
        `*${SCENE_VIEW_STORY_TEXTS.accessModifier}:* ${story.accessModifier}\n\n` +
        `*${SCENE_VIEW_STORY_TEXTS.content}:*\n_${story.content}_`;

      await this.sendMessageOrEdit(ctx, text, this.getKeyboard(), 'Markdown');
    } catch (error) {
      this.logger.error('Ошибка при просмотре истории:', error);
      await this.sendMessageOrEdit(ctx, SCENE_VIEW_STORY_TEXTS.error);
      await ctx.scene.enter('show_stories');
    }
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const action = query.data;
    const state = this.getState(ctx);

    switch (action) {
      case 'edit_story':
        await ctx.answerCbQuery();
        await ctx.scene.enter('edit_story', {
          storyId: state.storyId,
          accessModifier: state.accessModifier,
          step: 'choose_action',
        });
        break;
      case 'back':
        await ctx.answerCbQuery();
        await ctx.scene.enter('show_stories');
        break;
      default:
        await ctx.answerCbQuery('Неизвестная команда.');
    }
  }

  private getKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.editStory, 'edit_story')],
      [Markup.button.callback(BUTTON_TEXTS.backToStories, 'back')],
    ]);
  }
}
