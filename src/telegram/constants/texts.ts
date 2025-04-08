export const BUTTON_TEXTS = {
  write_story: 'Записать историю',
  show_stories: 'Мои истории',
  stories_feed: 'Лента историй',
  back: '🔄 Назад',
  cancel: '❌ Отмена',
  editTitle: 'Изменить название',
  changeAccessModifier: 'Сменить модификатор доступа',
  editContent: 'Редактировать текст',
  backToStories: '↩️ Назад к историям',
  editStory: '✏️ Изменить',
  like: '👍',
  dislike: '👎',
  backToMenu: '↩️ Назад',
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

export const SCENE_EDIT_STORY_TEXTS = {
  chooseAction: 'Что вы хотите изменить?',
  editTitlePrompt: 'Введите новое название:',
  titleUpdated: 'Название успешно изменено!',
  editContentPrompt: 'Введите новый текст истории:',
  contentUpdated: 'Текст истории успешно изменен!',
  invalidStep: 'Произошла ошибка. Попробуйте снова.',
  error: 'Произошла ошибка. Попробуйте позже.',
  invalidContent: 'Неверный контент',
  invalidTitle: 'Неверный заголовок',
  storyNotFound: 'История не найдена',
};

export const SCENE_VIEW_STORY_TEXTS = {
  title: 'Название',
  accessModifier: 'Модификатор доступа',
  content: 'Текст истории',
  storyNotFound: 'История не найдена.',
  error: 'Произошла ошибка. Попробуйте позже.',
};

export const SCENE_STORIES_FEED_TEXTS = {
  title: 'Название',
  author: 'Автор',
  noMoreStories: 'Нет доступных историй ❗',
  like: 'Вы поставили лайк!',
  dislike: 'Вы поставили дизлайк!',
  error: 'Произошла ошибка. Попробуйте позже.',
};
