export const BUTTON_TEXTS = {
  write_story: 'Записать историю',
  show_stories: 'Мои истории',
  stories_feed: 'Лента историй',
  back: '🔄 Назад',
  cancel: '❌ Отмена',
};

export const SCENE_START_TEXTS = {
  greeting: 'Выберите опцию',
};

export const SCENE_WRITE_STORY_TEXTS = {
  greeting: 'Ожидаем вашу историю...',
  success: 'История успешно записана ✅',
  voiceNotSupported: 'Голосовые сообщения пока не поддерживаются.',
  cancelledMessage: 'Запись истории отменена ❌',
};

export const TEMP_MESSAGES = {
  developing: 'В разработке...',
};

export const SCENE_SHOW_STORIES_TEXTS = {
  greeting: 'Ваши истории:',
  noStoriesFound: 'У вас пока нет историй.',
  storiesList: 'Выберите историю для просмотра:',
  searchPrompt: 'Введите текст для поиска:',
  searchResults: (query: string) => `Результаты поиска по запросу "${query}":`,
  noSearchResults: (query: string) =>
    `Истории по запросу "${query}" не найдены.`,
};
