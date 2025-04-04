import { Scenes } from 'telegraf';

interface CustomSession extends Scenes.SceneSession {
  data?: object;
}

export interface Context extends Scenes.SceneContext {
  session: CustomSession;
}
