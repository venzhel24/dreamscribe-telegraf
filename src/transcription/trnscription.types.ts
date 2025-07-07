export interface TranscriptionJobData {
  audioUrl: string;
  userId: number;
  messageId: number;
}

export interface TranscriptionResult {
  text: string;
  userId: number;
  messageId: number;
}
