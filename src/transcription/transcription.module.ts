import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscriptionService } from './services/transcription.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transcription_jobs',
    }),
    BullModule.registerQueue({
      name: 'transcription_results',
    }),
  ],
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
