export interface QuoteMetadata {
  quote: string;
  author: string;
  visualPrompt: string;
  description: string;
  mood: string;
}

export interface GeneratedCard {
  metadata: QuoteMetadata;
  imageUrl: string;
}

export enum GenerationState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}