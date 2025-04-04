import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../types/tgbot.context';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();

    await ctx.replyWithHTML(
      `<b>Error</b>: ${exception.message} ${exception.stack}`,
    );
    // await ctx.reply(`Пупупу... Ошибочка`);
    this.logger.error(exception.message, exception.stack);
  }
}
