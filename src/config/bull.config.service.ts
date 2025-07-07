import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bullmq/dist/interfaces/shared-bull-config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions {
    return {
      connection: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
        password: this.configService.get<string>('REDIS_PASSWORD'),
      },
    };
  }
}
