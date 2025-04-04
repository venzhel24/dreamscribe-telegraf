import { Injectable } from '@nestjs/common';
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from './types/tgbot.context';
@Injectable()
@Update()
export class TelegramService {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.scene.enter('start');
  }
}
