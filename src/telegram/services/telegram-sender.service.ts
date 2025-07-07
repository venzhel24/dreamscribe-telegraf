import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramSenderService {
  private readonly bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);
  }

  async sendMessage(chatId: number, text: string, extra?: any) {
    await this.bot.telegram.sendMessage(chatId, text, extra);
  }
}
