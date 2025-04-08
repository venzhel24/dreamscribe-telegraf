import { Ctx, Scene, SceneEnter, On, Message } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/services/story.service';
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
        throw new Error('Неизвестный шаг');
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
      case 'cancel':
        await ctx.answerCbQuery();
        await this.cancelAndReturnToChooseAction(ctx);
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

    if (!story) {
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.storyNotFound);
      await ctx.scene.enter('show_stories');
      return;
    }

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
      case 'change_access_modifier':
      case 'edit_content':
        await ctx.scene.enter('edit_story', {
          ...this.getState(ctx),
          step: action,
        });
        break;
      default:
        await ctx.answerCbQuery('Неизвестное действие.');
    }
  }

  private async editTitle(ctx: Context) {
    await this.sendMessageOrEdit(
      ctx,
      SCENE_EDIT_STORY_TEXTS.editTitlePrompt,
      this.getCancelButton(),
    );
  }

  private async updateTitle(ctx: Context, newTitle: string) {
    const state = this.getState(ctx);

    if (!newTitle.trim()) {
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.invalidTitle);
      return;
    }

    await this.storyService.update(state.storyId, { title: newTitle });
    await this.cancelAndReturnToChooseAction(ctx);
  }

  private async changeAccessModifier(ctx: Context) {
    const state = this.getState(ctx);
    const story = await this.storyService.findOne(state.storyId);

    if (!story) {
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.storyNotFound);
      await ctx.scene.enter('show_stories');
      return;
    }

    const currentModifier = story.accessModifier || 'private';
    const newModifier = currentModifier === 'private' ? 'public' : 'private';

    await this.storyService.update(state.storyId, {
      accessModifier: newModifier,
    });
    await this.cancelAndReturnToChooseAction(ctx);
  }

  private async editContent(ctx: Context) {
    await this.sendMessageOrEdit(
      ctx,
      SCENE_EDIT_STORY_TEXTS.editContentPrompt,
      this.getCancelButton(),
    );
  }

  private async updateContent(ctx: Context, newContent: string) {
    const state = this.getState(ctx);

    if (!newContent.trim()) {
      await ctx.reply(SCENE_EDIT_STORY_TEXTS.invalidContent);
      return;
    }

    await this.storyService.update(state.storyId, { content: newContent });
    await this.cancelAndReturnToChooseAction(ctx);
  }

  private cancelAndReturnToChooseAction(ctx: Context) {
    return ctx.scene.enter('edit_story', {
      ...this.getState(ctx),
      step: 'choose_action',
    });
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
}
