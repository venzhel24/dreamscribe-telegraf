import { Ctx, Scene, SceneEnter, On, Message } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/story.service';
import {
  SCENE_EDIT_STORY_TEXTS,
  BUTTON_TEXTS,
  SCENE_VIEW_STORY_TEXTS,
} from '../constants/texts';
import { BaseScene } from './base.scene';

@Scene('edit_story')
@UseFilters(TelegrafExceptionFilter)
export class EditStoryScene extends BaseScene {
  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    if (!state.step) {
      await ctx.scene.enter('edit_story', {
        ...state,
        step: 'choose_action',
      });
      return;
    }

    switch (state.step) {
      case 'choose_action':
        await this.chooseAction(ctx);
        break;
      case 'edit_title':
        await this.editTitle(ctx);
        break;
      case 'change_access_modifier':
        await this.changeAccessModifier(ctx);
        break;
      case 'edit_content':
        await this.editContent(ctx);
        break;
      default:
        await ctx.reply(SCENE_EDIT_STORY_TEXTS.error);
        await ctx.scene.enter('start');
    }
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const [action, value] = query.data.split(':');
    switch (action) {
      case 'action':
        await this.handleAction(ctx, value);
        break;
      case 'back':
        await ctx.answerCbQuery();
        await ctx.scene.enter('show_stories');
        break;
      default:
        await ctx.answerCbQuery('Неизвестная команда.');
    }
  }

  @On('text')
  async onTextMessage(@Ctx() ctx: Context, @Message('text') msg: string) {
    const state = this.getState(ctx);

    switch (state.step) {
      case 'edit_title':
        await this.updateTitle(ctx, msg);
        break;
      case 'edit_content':
        await this.updateContent(ctx, msg);
        break;
      default:
        await ctx.reply(SCENE_EDIT_STORY_TEXTS.invalidStep);
    }
  }

  private async chooseAction(ctx: Context) {
    const state = this.getState(ctx);
    const story = await this.storyService.findOne(state.storyId);
    const text =
      `*${SCENE_VIEW_STORY_TEXTS.title}:* ${story.title}\n` +
      `*${SCENE_VIEW_STORY_TEXTS.accessModifier}:* ${story.accessModifier}\n\n` +
      `*${SCENE_VIEW_STORY_TEXTS.content}:*\n_${story.content}_`;

    await this.sendMessageOrEdit(
      ctx,
      text + '\n\n' + SCENE_EDIT_STORY_TEXTS.chooseAction,
      this.getActionsKeyboard(),
    );
  }

  private async handleAction(ctx: Context, action: string) {
    switch (action) {
      case 'edit_title':
        await ctx.scene.enter('edit_story', {
          ...this.getState(ctx),
          step: 'edit_title',
        });
        break;
      case 'change_access_modifier':
        await ctx.scene.enter('edit_story', {
          ...this.getState(ctx),
          step: 'change_access_modifier',
        });
        break;
      case 'edit_content':
        await ctx.scene.enter('edit_story', {
          ...this.getState(ctx),
          step: 'edit_content',
        });
        break;
      default:
        await ctx.answerCbQuery('Неизвестное действие.');
    }
  }

  private async editTitle(ctx: Context) {
    await ctx.reply(
      SCENE_EDIT_STORY_TEXTS.editTitlePrompt,
      this.getBackButton(),
    );
  }

  private async updateTitle(ctx: Context, newTitle: string) {
    const state = this.getState(ctx);

    try {
      await this.storyService.update(state.storyId, { title: newTitle });
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.titleUpdated);
      await ctx.scene.enter('edit_story', {
        ...state,
        step: 'choose_action',
      });
    } catch (error) {
      this.logger.error('Ошибка при обновлении названия:', error);
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.error);
    }
  }

  private async changeAccessModifier(ctx: Context) {
    const state = this.getState(ctx);
    const currentModifier = state.accessModifier || 'private';

    const newModifier = currentModifier === 'private' ? 'public' : 'private';

    try {
      await this.storyService.update(state.storyId, {
        accessModifier: newModifier,
      });
      await ctx.reply(
        SCENE_EDIT_STORY_TEXTS.accessModifierChanged(newModifier),
        this.getBackButton(),
      );
      await ctx.scene.enter('edit_story', {
        ...state,
        step: 'choose_action',
        accessModifier: newModifier,
      });
    } catch (error) {
      this.logger.error('Ошибка при изменении модификатора доступа:', error);
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.error);
    }
  }

  private async editContent(ctx: Context) {
    await ctx.reply(
      SCENE_EDIT_STORY_TEXTS.editContentPrompt,
      this.getBackButton(),
    );
  }

  private async updateContent(ctx: Context, newContent: string) {
    const state = this.getState(ctx);

    try {
      await this.storyService.update(state.storyId, { content: newContent });
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.contentUpdated);
      await ctx.scene.enter('edit_story', {
        ...state,
        step: 'choose_action',
      });
    } catch (error) {
      this.logger.error('Ошибка при обновлении содержимого:', error);
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.error);
    }
  }

  private getActionsKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.editTitle, 'action:edit_title')],
      [
        Markup.button.callback(
          BUTTON_TEXTS.changeAccessModifier,
          'action:change_access_modifier',
        ),
      ],
      [Markup.button.callback(BUTTON_TEXTS.editContent, 'action:edit_content')],
      [Markup.button.callback(BUTTON_TEXTS.backToStories, 'back')],
    ]);
  }

  private getBackButton() {
    return Markup.inlineKeyboard([
      [Markup.button.callback(BUTTON_TEXTS.backToStories, 'back')],
    ]);
  }
}
