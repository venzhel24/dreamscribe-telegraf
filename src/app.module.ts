import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DbConfigService } from './config/db.config.service';
import { StoryModule } from './story/story.module';
import { TelegramModule } from './telegram/telegram.module';
import { BullModule } from '@nestjs/bullmq';
import { BullConfigService } from './config/bull.config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DbConfigService,
      inject: [DbConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    StoryModule,
    TelegramModule,
    BullModule.forRootAsync({
      useClass: BullConfigService,
      inject: [BullConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
