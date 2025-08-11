import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { TelegramSenderService } from '../services/telegram-sender.service';

interface TranscriptionResult {
  text: string;
  userId: number;
  messageId: number;
}

@Processor('transcription_results')
@Injectable()
export class TranscriptionResultConsumer extends WorkerHost {
  constructor(
    private readonly telegramSender: TelegramSenderService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job<TranscriptionResult>): Promise<void> {
    const { text, userId, messageId } = job.data;

    this.logger.log(`Processing transcription result for user ${userId}, message ${messageId}`);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✏️ Редактировать', 'edit_transcript')],
      [Markup.button.callback('🔄 Перезаписать', 'rewrite_transcript')],
      [Markup.button.callback('✅ Подтвердить', 'confirm_transcript')],
    ]);

    try {
      await this.telegramSender.sendMessage(
        userId,
        `Ваша история:\n${text}`,
        keyboard,
      );
      this.logger.log(`Transcription result sent successfully to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending transcription result to user ${userId}:`, error);
      throw error;
    }
  }
}
