import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TranscriptionJobData } from '../trnscription.types';

@Injectable()
export class TranscriptionService {
  constructor(
    @InjectQueue('transcription_jobs')
    private readonly transcriptionQueue: Queue,
  ) {}

  async addTranscriptionJob(data: TranscriptionJobData) {
    await this.transcriptionQueue.add('process-audio', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 1000,
    });
  }
}
