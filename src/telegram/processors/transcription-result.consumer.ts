import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
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
  constructor(private readonly telegramSender: TelegramSenderService) {
    super();
  }

  async process(job: Job<TranscriptionResult>): Promise<void> {
    const { text, userId } = job.data;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✏️ Редактировать', 'edit_transcript')],
      [Markup.button.callback('🔄 Перезаписать', 'rewrite_transcript')],
      [Markup.button.callback('✅ Подтвердить', 'confirm_transcript')],
    ]);

    await this.telegramSender.sendMessage(
      userId,
      `Ваша история:\n${text}`,
      keyboard,
    );
  }
}
