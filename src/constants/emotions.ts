import type { TEmotion, TTargetEmotion } from '@/types/emotion';

export const MODEL_ID = 'onnx-community/Speech-Emotion-Classification-ONNX';
export const MODEL_DTYPE = 'q8';
export const MODEL_SIZE_MB = 95;
export const MODEL_CARD_URL = 'https://huggingface.co/prithivMLmods/Speech-Emotion-Classification';
export const ANALYSIS_WINDOW_SECONDS = 1.5;
export const ANALYSIS_HOP_SECONDS = 0.5;

export const MODEL_LABELS: Record<string, TEmotion> = {
  ANG: 'angry',
  CAL: 'calm',
  DIS: 'disgust',
  FEA: 'fear',
  HAP: 'happy',
  NEU: 'neutral',
  SAD: 'sad',
  SUR: 'surprise',
};

export const EMOTIONS: Record<TEmotion, { name: string; direction: string }> = {
  angry: { name: 'Angry', direction: 'furious' },
  calm: { name: 'Calm', direction: 'perfectly calm' },
  disgust: { name: 'Disgusted', direction: 'disgusted' },
  fear: { name: 'Scared', direction: 'terrified' },
  happy: { name: 'Happy', direction: 'bursting with joy' },
  neutral: { name: 'Neutral', direction: 'flatly' },
  sad: { name: 'Sad', direction: 'heartbroken' },
  surprise: { name: 'Surprised', direction: 'in total disbelief' },
};

export const TARGET_EMOTIONS: TTargetEmotion[] = [
  'angry',
  'happy',
  'sad',
  'surprise',
  'fear',
  'calm',
];

export const TARGET_ALIASES: Partial<Record<TTargetEmotion, TEmotion[]>> = { calm: ['neutral'] };
