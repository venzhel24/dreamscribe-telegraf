import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@telegraf/session/redis';
import { session } from 'telegraf';

@Injectable()
export class TelegramConfigService implements TelegrafOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTelegrafOptions():
    | Promise<TelegrafModuleOptions>
    | TelegrafModuleOptions {
    const token = this.configService.get<string>('BOT_TOKEN');

    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisPass = this.configService.get<string>('REDIS_PASS');

    const redisUrl = `redis://${redisPass ? `${redisPass}@` : ''}${redisHost}:${redisPort}`;

    // Создаем Redis хранилище
    const store = Redis({
      url: redisUrl,
    });

    return {
      token: token,
      middlewares: [
        session({
          store: store,
        }),
      ],
    };
  }
}
