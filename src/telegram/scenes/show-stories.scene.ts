import { Ctx, Scene, SceneEnter, On, Message } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegrafExceptionFilter } from '../exceptions/telegraf-exception.filter';
import { Context } from '../types/tgbot.context';
import { StoryService } from '../../story/story.service';
import { SCENE_SHOW_STORIES_TEXTS } from '../constants/texts';
import { BaseScene } from './base.scene';

@Scene('show_stories')
@UseFilters(TelegrafExceptionFilter)
export class ShowStoriesScene extends BaseScene {
  private readonly itemsPerPage = 5;

  constructor(
    logger: Logger,
    private readonly storyService: StoryService,
  ) {
    super(logger);
  }

  @SceneEnter()
  async enterScene(@Ctx() ctx: Context) {
    const state = this.getState(ctx);

    if (state.searchQuery) {
      await this.handleSearch(ctx, state.searchQuery, state.page || 1);
    } else {
      await this.showStories(ctx, state.page || 1);
    }
  }

  @On('text')
  async onTextMessage(@Ctx() ctx: Context, @Message('text') msg: string) {
    await ctx.scene.enter('show_stories', {
      searchQuery: msg,
      page: 1,
    });
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const query = ctx.callbackQuery;
    if (!(query && 'data' in query)) return;

    const [action, value] = query.data.split(':');
    switch (action) {
      case 'page':
        await this.showStories(ctx, parseInt(value, 10));
        break;
      case 'search':
        await ctx.answerCbQuery();
        await ctx.reply(SCENE_SHOW_STORIES_TEXTS.searchPrompt);
        break;
      case 'view_story':
        await ctx.answerCbQuery();
        await ctx.scene.enter('view_story', { storyId: value });
        break;
      case 'back_to_list':
        await ctx.answerCbQuery();
        // await ctx.scene.enter('show_stories');
        await ctx.scene.enter('start', {
          canEditMessage: true,
          message: 'Просмотр историй в разработке',
        });
        break;
      case 'back':
        await ctx.answerCbQuery();
        await ctx.scene.enter('start', { canEditMessage: true });
        break;
      default:
        await ctx.answerCbQuery('Неизвестная команда.');
    }
  }

  private async showStories(ctx: Context, page: number) {
    const telegramId = ctx.from.id;
    const skip = (page - 1) * this.itemsPerPage;

    const stories = await this.storyService.findUserStories(
      telegramId,
      skip,
      this.itemsPerPage,
    );
    const totalStories = await this.storyService.countUserStories(telegramId);

    if (!stories.length) {
      await ctx.reply(
        SCENE_SHOW_STORIES_TEXTS.noStoriesFound,
        this.getBackButton(),
      );
      return;
    }

    const keyboard = stories.map((story) => [
      Markup.button.callback(
        `${story.title} | ${story.accessModifier} | ${this.formatDate(story.updatedAt)}`,
        `view_story:${story.id}`,
      ),
    ]);

    const totalPages = Math.ceil(totalStories / this.itemsPerPage);

    const paginationButtons = this.getPaginationKeyboard(page, totalPages);
    keyboard.push(...paginationButtons);

    if (page === 1) {
      keyboard.push([Markup.button.callback('↩️ Назад на главную', 'back')]);
    }

    await this.sendMessageOrEdit(
      ctx,
      SCENE_SHOW_STORIES_TEXTS.storiesList,
      Markup.inlineKeyboard(keyboard),
    );
  }

  private async handleSearch(ctx: Context, query: string, page: number) {
    const telegramId = ctx.from.id;
    const skip = (page - 1) * this.itemsPerPage;

    const stories = await this.storyService.searchStories(
      telegramId,
      query,
      skip,
      this.itemsPerPage,
    );
    const totalStories = await this.storyService.countSearchResults(
      telegramId,
      query,
    );

    if (!stories.length) {
      await ctx.reply(
        SCENE_SHOW_STORIES_TEXTS.noSearchResults(query),
        Markup.inlineKeyboard([
          [Markup.button.callback('↩️ Назад к историям', 'back_to_list')],
        ]),
      );
      return;
    }

    const keyboard = stories.map((story) => [
      Markup.button.callback(
        `${story.title} | ${story.accessModifier} | ${this.formatDate(story.updatedAt)}`,
        `view_story:${story.id}`,
      ),
    ]);

    const totalPages = Math.ceil(totalStories / this.itemsPerPage);

    const paginationButtons = this.getPaginationKeyboard(page, totalPages);
    keyboard.push(...paginationButtons);

    keyboard.push([
      Markup.button.callback('↩️ Назад к историям', 'back_to_list'),
    ]);

    await this.sendMessageOrEdit(
      ctx,
      `${SCENE_SHOW_STORIES_TEXTS.searchResults(query)}`,
      Markup.inlineKeyboard(keyboard),
    );
  }

  private getPaginationKeyboard(page: number, totalPages: number) {
    const buttons = [];

    if (page > 1) {
      buttons.push(Markup.button.callback('⬅️ Назад', `page:${page - 1}`));
    }

    buttons.push(Markup.button.callback('🔍 Поиск', 'search'));

    if (page < totalPages) {
      buttons.push(Markup.button.callback('Вперед ➡️', `page:${page + 1}`));
    }

    return [buttons];
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return new Date(date).toLocaleDateString('ru-RU', options);
  }

  private getBackButton() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('↩️ Назад на главную', 'back')],
    ]);
  }
}
