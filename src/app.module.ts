import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DbConfigService } from './config/db.config.service';
import { StoryModule } from './story/story.module';
import { RatingModule } from './rating/rating.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DbConfigService,
      inject: [DbConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    StoryModule,
    RatingModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
